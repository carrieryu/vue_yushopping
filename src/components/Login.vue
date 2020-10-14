<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="head_portrait">
        <img src="../assets/logo.png" />
      </div>
      <!-- 登录表单 -->
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请填写您的账号"
            prefix-icon="fa fa-user-circle-o"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请填写您的密码"
            prefix-icon="fa fa-unlock-alt"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="loginFormReset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
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
      },
    }
  },
  methods: {
    loginFormReset() {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200)
          return this.$message.error('用户不存在，登录失败')
        this.$message.success('登录成功')
        console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2f4056;
  height: 100%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
}
.login_box {
  height: 350px;
  width: 500px;
  background-color: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 15px;

  .head_portrait {
    width: 100px;
    height: 100px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #f2f2f2;
    border-radius: 50%;
    padding: 5px;
    border: 1px solid #eee;
    box-shadow: 1px 1px 5px #ddd;
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 25px;
    box-sizing: border-box;
  }

  .btn {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
