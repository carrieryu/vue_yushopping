<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="只允许为第三级分类设置相关参数！" show-icon type="warning" :closable="false"></el-alert>
      <!-- 选择区域 -->
      <el-row class="cat_op">
        <el-col>
          <span>请选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="cateSelectedKey"
            :options="cateList"
            :props="cateProp"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="btnDisable" @click="addDialogVisible=true">添加参数</el-button>
          <el-table :data="getManyTable" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row,i)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 添加新参标</el-button>
              </template>
            </el-table-column>
            <!-- 列表 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="warning" size="small" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeParams(scope.row.attr_id,scope.row.attr_name)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="btnDisable" @click="addDialogVisible=true">添加属性</el-button>

          <el-table :data="getOnlyTable" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
               <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row,i)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 添加新参标</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="warning" size="small" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeParams(scope.row.attr_id,scope.row.attr_name)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+textTitle"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="closeAddDialog()"
    >
      <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
        <el-form-item :label="textTitle+'名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'修改'+textTitle"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="closeEditDialog()"
    >
      <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="editFormRules">
        <el-form-item :label="textTitle+'名称'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      // 级联选择框的配置对象
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 级联选择框的双向绑定数据
      cateSelectedKey: [],
      // 默认高亮标签页
      activeName: 'many',
      // 动态参数面板数据
      getManyTable: [],
      // 静态属性面板数
      getOnlyTable: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 存储添加表单信息
      addForm: {
        attr_name: '',
      },
      // 修改表单的数据对象
      editForm: {},
      // 控制标签按钮和输入框的切换，true显示input，false显示按钮
      inputVisible: false,
      // 存储标签input输入框的输入内容
      inputValue: '',
      // 添加表单规则
      addFormRules: {
        attr_name: {
          required: true,
          message: '请输入名称',
          trigger: 'blur',
        },
      },
      // 修改表单验证规则
      editFormRules: {
        attr_name: {
          required: true,
          message: '请输入名称',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框旋转式触发的函数
    handleChange() {
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      // 选中的不是三级分类
      if (this.cateSelectedKey.length !== 3) {
        this.cateSelectedKey = []
        this.getOnlyTable=[]
        this.getManyTable=[]
        return this.$message.warning('只能选中三级的商品分类，请重新选择~')
      }
      // 选中的是三级分类
      // console.log(this.cateSelectedKey)
      // 根据选择的id和标签页面板获取参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败~')
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      // 根据标签页动态挂载数据
      if (this.activeName === 'many') {
        this.getManyTable = res.data
        // console.log('动态参数数据')
      } else {
        this.getOnlyTable = res.data
        // console.log('静态属性数据')
      }
    },
    //标签页点击事件的处理函数
    handleTabsClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 关闭添加对话框的监听事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 打开修改窗口
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败~')
      }
      this.editForm = res.data
      console.log(res.data)
      this.editDialogVisible = true
    },
    // 关闭修改对话框的监听事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 确定添加属性
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败~')
        }
        console.log(res.data)
        this.$message.success("您已成功添加~'" + this.addForm.attr_name + "'")
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 确定修改属性/参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败~')
        }
        this.$message.success('修改成功~')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 删除属性/参数
    async removeParams(attr_id, attr_name) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除'" + attr_name + "'是否继续？",
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true,
        }
      ).catch((err) => err)
      // console.log(confirmResult)
      if (confirmResult == 'cancel') {
        return this.$message.info("您已取消删除'" + attr_name + "'")
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error("您已取消删除'" + attr_name + "'")
      }
      console.log(res.data)
      this.$message.success("您已成功删除了'" + attr_name + "'")
      this.getParamsData()
    },
    // 文本框失去焦点或按下enter键时触发事件
    async handleInputConfirm(row) {
      // 用户输入的内容为空，不合法    trim去除字符串前后空格
      if(row.inputValue.trim().length === 0){
        row.inputValue=''
        row.inputVisible = false
        return
      }
      // 没有return，说明输入的内容要进行后续处理
      row.attr_vals.push(row.inputValue)
      row.inputValue=''
      row.inputVisible=false
      // const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
      //   attr_name:row.attr_name,
      //   attr_sel:row.attr_sel,
      //   attr_vals:row.attr_vals.join(',')
      // })
      // if(res.meta.status !== 200){
      //   return this.$message.error('修改参数项失败~')
      // }
      // this.$message.success('修改参数项成功~')
      this.saveAttrVals(row)
    },
    // 编辑AttrVals的操作，将对attr_vals的操作保存到数据库中
    async saveAttrVals(row){
       const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(',')
      })
      if(res.meta.status !== 200){
        return this.$message.error('修改参数项失败~')
      }
      this.$message.success('修改参数项成功~')
    },
    //关闭参数选项（删除参数选项） 
    handleClose(row,i){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    },
    // 显示文本框
    showInput(row) {
      // 此时页面还没有被重新渲染
      row.inputVisible = true
      //让文本框自动获得焦点。$nextTick方法：当页面上的元素被重新渲染的时候，才会指定回调函数中的代码
      this.$nextTick((_) => {
        // input->原生dom对象
        this.$refs.saveTagInput.$refs.input.focus()
      })
      // 要在页面完全重新渲染的时候调用这个函数，不然获取不到ref
      // this.$refs.saveTagInput.$refs.input.focus();
    },
  },
  // 计算属性
  computed: {
    // 标签页面板按钮是否禁用
    btnDisable() {
      // 如果未选择，禁用，返回true
      if (this.cateSelectedKey.length !== 3) {
        return true
      }
      return false
    },
    // 存储选择的三级分类id
    cateId() {
      if (this.cateSelectedKey.length === 3) {
        return this.cateSelectedKey[2]
      }
      return null
    },
    textTitle() {
      if (this.activeName == 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>
<style lang="less" scoped>
.cat_op {
  margin: 15px 0 0 5px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>