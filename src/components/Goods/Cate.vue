<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加商品分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类列表区域 -->
      <tree-table
        :data="catelist"
        :columns="cateColumns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效类列模板 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-circle-check"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-circle-close" v-else style="color:red;"></i>
        </template>
        <!-- 排序列模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="warning" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="info" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作列模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="warning"
            size="small"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="removeCate(scope.row.cat_id,scope.row.cat_name)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3, 5, 10, 20, 50]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="closeAddCateDialog()"
    >
      <!-- 添加商品分类表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 指定数据源  props 指定配置对象 -->
          <el-cascader
            v-model="selectedParentCateIds"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            placeholder="请选择》》若未选择默认为顶级分类~"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑商品分类对话框 -->
    <el-dialog
      title="编辑商品分类信息"
      :visible.sync="editCateDialogVisible"
      width="40%"
      @close="closeEditCateDialog"
    >
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="editCateFormRules"
        label-width="100px"
      >
        <p>您正在操作的分类id：{{editCateForm.cat_id}}</p>
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表数据
      catelist: [],
      // 存储查询条件参数
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 存分类总数
      total: 0,
      // 添加商品分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加商品分类表单的数据绑定对象
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 要添加分类的父类id
        cat_pid: 0,
        // 要添加分类的等级，默认为一级分类
        cat_level: 0,
      },
      // 修改商品分类信息的数据绑定对象
      editCateForm: {},
      // 获取分类的父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      // 选中的父类id数组
      selectedParentCateIds: [],
      // 编辑商品分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 添加商品分类的验证规则
      addCateFormRules: {
        cat_name: {
          required: true,
          message: '请输入商品分类名称',
          trigger: 'blur',
        },
      },
      // 修改商品分类的验证规则
      editCateFormRules: {
        cat_name: {
          required: true,
          message: '请输入商品分类名称',
          trigger: 'blur',
        },
      },
      // 为商品分类列表指定列的定义
      cateColumns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'order',
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'opt',
        },
      ],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryinfo,
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$messages.error('查询商品分类列表失败')
      }
      // console.log(res.data)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 绑定分页每页条数数据的改变-》每页多少条
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getCateList()
    },
    // handleCurrentChange->当前页
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getCateList()
    },
    // 打开添加商品分类对话框
    showAddCateDialog() {
      // 获取父级分类列表
      this.getParentCateList()
      // 显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$messages.error('获取父级分类列表失败~')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化时触发的函数
    parentCateChange() {
      console.log(this.selectedParentCateIds)
      // 如果得到的数组length为0说明没有父分类，等级为0
      // 反之父分类为数组的最后一个数值
      if (this.selectedParentCateIds.length > 0) {
        this.addCateForm.cat_pid = this.selectedParentCateIds[
          this.selectedParentCateIds.length - 1
        ]
        this.addCateForm.cat_level = this.selectedParentCateIds.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 确定添加商品分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败~')
        }
        // console.log(res)
        this.$message.success('添加商品分类成功~')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 关闭添加商品分类对话框的监听事件
    closeAddCateDialog() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedParentCateIds = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 打开编辑分类对话框
    async showEditCateDialog(cat_id) {
      //根据id 获取目前所在分类信息
      const { data: res } = await this.$http.get('categories/' + cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败~')
      }
      console.log(res.data)
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 确定修改商品分类信息
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品分类信息失败~')
        }
        console.log(res.data)
        this.$message.success('修改商分类信息成功~')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 关闭修改商品分类信息对话框的监听事件
    closeEditCateDialog() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除商品分类
    async removeCate(cat_id, cat_name) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除分类'" + cat_name + "',确定继续吗？",
        '删除上商品分类提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err)=>err)
      if (confirmResult == 'cancel') {
        return this.$message.info("您已取消删除分类'" + cat_name + "'")
      }
      const {data:res} = await this.$http.delete('categories/' + cat_id)
      if(res.meta.status !==200){
        return this.$message.error('删除商品分类失败~')
      }
      this.$message.success('删除商品分类成功~')
      this.getCateList()
    },
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>