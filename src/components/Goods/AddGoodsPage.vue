<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表-》添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示信息区域 -->
      <el-alert title="添加商品" type="info" :closable="false" center show-icon></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex-0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        label-position="top"
        label-width="100px"
        :model="addForm"
        ref="addFormRef"
        :rules="addFormRules"
      >
        <!-- 左侧标签 -->
        <el-tabs
          style="height: 100%;"
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClicked"
        >
          <!-- 添加基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 添加商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyCateData" :key="item.attr_id">
              <!-- <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="checkAllVals"
                @change="handleCheckAllChange"
              >全选</el-checkbox>
              <div style="margin: 15px 0;"></div>-->
              <el-checkbox-group v-model="item.attr_vals" @change="handleCheckedAttrValsChange">
                <el-checkbox v-for="(cb,i) in item.attr_vals" :label="cb" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyCateData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action上传图片的地址,list-type图片展示的方式 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button class="addGoodsBtn" type="primary" @click="addGoods()">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="imgPreviewDialogVisible" width="50%" class="previewImg">
      <img :src="previewPath" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条索引
      activeIndex: '0',
      //   添加商品的表单数据
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        goods_cat: [],
        pics: [],
        // 商品详情（介绍）
        goods_introduce: '',
        // 商品参数，包含动态参数和静态属性
        attrs: [],
      },
      //   商品分类数据
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 获取到的动态参数
      manyCateData: [],
      // 获取到的静态属性
      onlyCateData: [],
      //添加商品规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      // 上传图片的地址
      uploadUrl: 'http://qkongtao.cn:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片预览-》图片的真实地址
      previewPath: '',
      // 图片预览对话框
      imgPreviewDialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败~')
      }
      this.cateList = res.data
      console.log(res.data)
    },
    // 级联选择框选中项变化时触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.info('请选择三级分类~')
      }
    },
    //切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabsLeave(activeName, oldActiveName) {
      // console.log('原先的标签页===='+oldActiveName)
      // console.log('即将要进入的标签页===='+activeName)
      // return false
      if (activeName !== '0' && this.addForm.goods_name.trim().length === 0) {
        this.$message.error('请填写商品名称')
        return false
      }
      if (activeName !== '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 标签点击时触发的函数
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败~')
        }
        console.log(res.data)
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyCateData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败~')
        }
        console.log(res.data)
        this.onlyCateData = res.data
      }
    },
    // 添加动态属性的复选框
    handleCheckedAttrValsChange() {},
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.imgPreviewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 根据临时路径，从pics数组中找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 将图片从pics数组中删除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      const picInfo = {
        pic: response.data.tmp_path,
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    async addGoods() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项~')
        }
        // 执行添加的业务逻辑
        // lodash 深拷贝 cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数和静态属性
        // 动态参数
        this.manyCateData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyCateData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('创建商品失败~')
        }
        this.$message.success('创建商品成功~已返回商品列表')
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
    },
  },
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 7px 0 0 !important;
}
.previewImg img {
  width: 100%;
}
.addGoodsBtn {
  margin: 15px 0;
}
</style>