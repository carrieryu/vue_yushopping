<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            class="input-with-select"
            v-model="goodsQueryinfo.query"
            clearable
            @clear="getGoodsList()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="openAddPage()">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" style="width:100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_id" label="id" width="90"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_number" label="库存" width="90"></el-table-column>
        <el-table-column prop="goods_weight" label="重量" width="90"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="150"></el-table-column>
        <el-table-column label="创建时间" width="170" prop="add_time">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="warning" size="small" icon="el-icon-edit">编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="removeGoods(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsQueryinfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="goodsQueryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品列表
      goodsList: [],
      // 商品请求参数
      goodsQueryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 总条数
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //   获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.goodsQueryinfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 分页-》每页显示条数
    handleSizeChange(newSize) {
      this.goodsQueryinfo.pagesize = newSize
      this.getGoodsList()
    },
    // 分页-》当前页
    handleCurrentChange(newPage) {
      this.goodsQueryinfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async removeGoods(goods_id) {
      const confirmRuslt = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmRuslt !== 'confirm') {
        return this.$message.info('您已成功取消了删除操作')
      }
      const { data: res } = await this.$http.delete('goods/' + goods_id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品操作失败~')
      }
      this.$message.success('删除成功~')
      this.getGoodsList()
    },
    // 打开添加商品页面
    openAddPage() {
      this.$router.push('/goods/addGoodsPage')
    },
  },
}
</script>
<style lang="less" scoped>
</style>