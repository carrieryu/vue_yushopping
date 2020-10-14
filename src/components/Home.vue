<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" />
        <span>FreeFish商城后台管理系统</span>
      </div>
      <el-button class type="info" @click="logout">注销</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'60px':'250px'">
        <el-menu
          unique-opened
          :default-active="activePath"
          class="el-menu-vertical-demo"
          background-color="#2f4056"
          text-color="#fff"
          active-text-color="#fb3395"
          :collapse="isCollapse"
          router
        >
          <div class="toggle_btn roateT" @click="toggleCollapse()" v-bind:class="roateText">+</div>
          <el-submenu :index="item.path+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveActivePath('/'+subItem.path)"
            >
              <i class="el-icon-star-off"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <!-- 主视图 -->
        <el-main>
          <router-view></router-view>
        </el-main>
        <!-- 页脚 -->
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconObj: {
        125: 'fa fa-user-o fa-lg',
        103: 'fa fa-check-square-o fa-lg',
        101: 'fa fa-truck fa-lg',
        102: 'fa fa-object-group fa-lg',
        145: 'fa fa-bar-chart fa-lg',
      },
      //折叠状态
      isCollapse: false,
      //+
      roateText: '',
      //被激活的nav链接地址
      activePath: '',
    }
  },
  created() {
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  methods: {
    //注销
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    //旋转+和菜蛋折叠
    toggleCollapse() {
      if (this.isCollapse == false) {
        this.roateText = 'roateTe'
        this.isCollapse = true
      } else {
        this.roateText = 'roateT'
        this.isCollapse = false
      }
    },
    //保存高亮nav激活状态
    saveActivePath(activePath) {
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
    },
  },
}
</script>
<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #393d49;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  img {
    height: 50px;
    width: 50px;
  }
}
.el-aside {
  background-color: #2f4056;
  .toggle_btn {
    font-size: 25px;
    color: #fff;
    text-align: center;
    background-color: rgba(35, 75, 97, 1);
    margin: 5px;
    line-height: 40px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
    .fa {
      margin-right: 27px;
    }
  }
}
.roateT {
  transform: rotate(50deg);
}
.roateTe {
  transform: rotate(90deg);
}
.el-main {
  background-color: #f2f2f2;
}
.el-footer {
  background-color: #dddddd;
}
</style>