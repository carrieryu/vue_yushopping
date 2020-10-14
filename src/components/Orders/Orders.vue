<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            class="input-with-select"
            clearable
            v-model="orderQueryInfo.query"
            @clear="getOrdersList()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList()"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="user_id" label="用户id"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="支付状态">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template slot-scope="scope">
            <template>{{scope.row.create_time | dateFormat}}</template>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="editAddressDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="small" @click="logisticsDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderQueryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="orderQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 编辑地址对话框 -->
    <el-dialog title="提示" :visible.sync="addressVisible" width="50%" @close="closeAddressVisible">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityDate"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息对话框 -->
    <el-dialog
  title="物流信息"
  :visible.sync="logisticsDialogVisible"
  width="900px">
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in logisticsList"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
  <span slot="footer" class="dialog-footer">
    <el-button @click="logisticsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="logisticsDialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>
<script>
import cityDate from './city_data2017_element.js'
export default {
  data() {
    return {
      orderQueryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 订单总数
      total: 0,
      // 订单列表
      ordersList: [],
      // 物流信息列表
      logisticsList:[],
      // 修改地址对话框的显示与隐藏
      addressVisible: false,
// 物流信息对话框的显示与隐藏
      logisticsDialogVisible:false,
      addressForm: {
        address1: [],
        address2: '',
      },
      addressFormRules: {
        address1: {
          required: true,
          message: '请选择省市区/县',
          trigger: 'blur',
        },
        address2: {
          required: true,
          message: '请填写详细地址',
          trigger: 'blur',
        },
      },
      cityDate,
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.orderQueryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败~')
      }
      console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.orderQueryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange(newPage) {
      this.orderQueryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 打开修改地址对话框
    editAddressDialog() {
      this.addressVisible = true
    },
    // 关闭修改地址对话框时清空修改地址表单
    closeAddressVisible() {
      this.$refs.addressFormRef.resetFields()
    },
    //打开物流信息对话框 
    async logisticsDialog(){
        const {data:res}=await this.$http.get('/kuaidi/1106975712662')
        if(res.meta.status !==200){
          return this.$message.error('获取物流信息失败~')
        }
        this.logisticsList=res.data
        console.log(this.logisticsList)
        this.logisticsDialogVisible=true
    }
  },
}
</script>
<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>