<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <!-- <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>-->
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 头部操作区域 -->
      <el-row :gutter="20">
        <el-col :span="13">
          <div class="grid-content">
            <el-input
              placeholder="请输入内容"
              class="input-with-select"
              v-model="userInfo.query"
              clearable
              @clear="getUserList()"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="grid-content">
            <el-button type="primary" @click="addUserVisible=true">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="用户角色" prop="role_name"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="手机" prop="mobile"></el-table-column>
        <el-table-column label="创建时间" prop="create_time"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="removeUserById(scope.row.id,scope.row.username)"
            ></el-button>
            <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[5, 10, 20, 50,100,200]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addUserVisible" width="30%" @close="closeAddDialog()">
        <el-form
          ref="addUserFormRef"
          :model="addUserForm"
          :rules="addUserFormRules"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addUserVisible=false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editUserVisible"
        width="30%"
        @close="closeEditDialog()"
      >
        <el-form
          ref="editUserFormRef"
          :model="editUserForm"
          label-width="80px"
          :rules="editUserFormRules"
        >
          <el-form-item label="账号">
            <el-input v-model="editUserForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editUserVisible=false">取 消</el-button>
          <el-button type="primary" @click="editedUserForm()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleVisible"
        width="35%"
        @close="closeSetRoleDialog()"
      >
        <div>
          <p>
            <strong>用户：{{userInfomation.username}}</strong>
          </p>
          <p>
            <strong>所属角色：{{userInfomation.role_name}}</strong>
          </p>
          <p>
            重新分配角色：
            <template>
              <el-select v-model="selectRoleModel" placeholder="请选择新的角色">
                <el-option
                  v-for="item in allRolesList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </template>
          </p>
        </div>
        <span slot="footer">
          <el-button @click="setRoleVisible=false">取 消</el-button>
          <el-button type="primary" @click="setRole()">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮箱~'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号码~'))
    }
    return {
      // 获取用户列表的参数
      userInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      userlist: [],
      total: 0,
      // 添加用户对话框的显示与隐藏
      addUserVisible: false,
      // 修改用户对话框的显示与隐藏
      editUserVisible: false,
      // 分配角色对话框的显示与隐藏
      setRoleVisible: false,
      // 存储-添加用户对话框里的信息
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //查询到的要修改的用户信息对象
      editUserForm: {},
      // 保存需要分配角色的用户信息
      userInfomation: {},
      // 存储角色列表
      allRolesList: [],
      // 存放选中的角色id
      selectRoleModel: '',
      //添加用户表单的验证规则对象
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 8,
            message: '账号长度为 3 到 8 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 修改用户信息表单的验证规则对象
      editUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 8,
            message: '账号长度为 3 到 8 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.userInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败~')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
      console.log(this.userlist)
    },
    // 监听pagesize事件
    handleSizeChange(newSize) {
      this.userInfo.pagesize = newSize
      this.getUserList()
      // console.log(newSize)
    },
    // 监听页码变化事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.userInfo.pagenum = newPage
      this.getUserList()
    },
    //监听switch状态开关
    async userStateChanged(userinfo) {
      // console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      // console.log(res.data)
      // console.log(res.meta)
      console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('哦吼，状态更新失败~')
      }
      this.$message.success('更新用户状态成功~')
    },
    // 关闭添加用户窗口的监听-》重置表单
    closeAddDialog() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 确认添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.data.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功~')
        this.addUserVisible = false
        this.getUserList()
      })
    },
    // 打开修改用户窗口
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.$message.success('查询用户成功')
      this.editUserForm = res.data
      this.editUserVisible = true
    },
    // 关闭修改用户窗口
    closeEditDialog() {
      this.$refs.editUserFormRef.resetFields()
    },
    //确认提交修改的用户信息
    editedUserForm() {
      this.$refs.editUserFormRef.validate(async (valid) => {
        // 预验证console.log(valid)
        if (!valid) return
        // 预验证通过，发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'users/' + this.editUserForm.id,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        //提示修改成功
        this.$message.success('修改用户信息成功')
        //更新成功，关闭对话框
        this.editUserVisible = false
        // 刷新数据列表
        this.getUserList()
      })
    },
    // 根据用户id删除用户
    async removeUserById(id, username) {
      // console.log(id)
      // 弹框提示
      const confirmResult = await this.$confirm(
        '此操作将永久删除用户' + username + ', 是否继续?',
        '删除用户提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 确定删除用户：返回字符串“confirm”
      // 取消删除用户：返回字符串“cancel”
      // console.log(confirmResult)
      if (confirmResult == 'cancel') {
        return this.$message.info('您已取消删除用户' + username + '的操作')
      }
      // console.log('确认删除用户'+username)
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('删除用户失败' + username)
      }
      this.$message.success('成功删除了用户' + username)
      this.getUserList()
    },
    // 打开分配权限对话框
    async showSetRoleDialog(userInfomation) {
      this.userInfomation = userInfomation
      // 获取所有角色
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有角色信息失败~')
      }
      this.allRolesList = res.data
      // console.log(this.allRolesList)
      this.setRoleVisible = true
    },
    async setRole() {
      if (!this.selectRoleModel) {
        return this.$message.error('请选择新的要分配角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfomation.id}/role`,
        {
          rid: this.selectRoleModel,
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败~')
      }
      this.$message.success(
        "您已成功更新了'" + this.userInfomation.username + "'用户的角色"
      )
      this.getUserList()
      this.setRoleVisible = false
    },
    // 监听关闭分配角色对话框的事件
    closeSetRoleDialog() {
      this.selectRoleModel=''
      this.userInfomation={}
    },
  },
}
</script>
<style lang="less" scoped>
</style>