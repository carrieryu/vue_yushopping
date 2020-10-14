<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(item1.authName,scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2===0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="7">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(item2.authName,scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="17">
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(item3.authName,scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
{{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="390px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditRoleDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeRole(scope.row.id,scope.row.roleName)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-thumb"
              size="small"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialog"
        width="30%"
        @close="closeAddRoleDialog()"
      >
        <el-form
          label-width="80px"
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addRoleDialog=false">取 消</el-button>
          <el-button type="primary" @click="addRole()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editRoleDialog"
        width="30%"
        @close="closeEditRoleDialog()"
      >
        <el-form
          label-width="80px"
          ref="editRoleFormRef"
          :model="editRoleForm"
          :rules="editRoleFormRules"
        >
          <el-form-item label="角色id">
            <el-input v-model="editRoleForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editRoleDialog=false">取 消</el-button>
          <el-button type="primary" @click="editRole()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightsDialog" width="50%" @close="closeSetRightsDialog()">
        <el-tree
          :props="setRightTreeProp"
          :data="setRightsList"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defIdKey"
          ref="treeRef"
        ></el-tree>
        <span slot="footer">
          <el-button @click="setRightsDialog=false">取 消</el-button>
          <el-button type="primary" @click="setRights()">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //    角色列表
      roleList: [],
      // 控制添加角色窗口的显示与隐藏
      addRoleDialog: false,
      // 修改窗口的显示与隐藏
      editRoleDialog: false,
      // 分配权限窗口的显示与隐藏
      setRightsDialog: false,
      // 存储添加角色对话框信息
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 修改角色对话框信息
      editRoleForm: {},
      // 分配权限列表
      setRightsList: [],
      // 分配权限-》树形控件的属性绑定对象
      setRightTreeProp:{
        label:'authName',
        children:'children'
      },
      // 存储要进行分配权限的角色id
      roleId:'',
      // 默认选中的权限数组
      defIdKey:[],
      addRoleFormRules: {
        roleName: {
          required: true,
          message: '请输入角色名称',
          trigger: 'blur',
        },
        roleDesc: {
          required: true,
          message: '请输入角色描述',
          trigger: 'blur',
        },
      },
      editRoleFormRules: {
        roleName: {
          required: true,
          message: '请输入角色名称',
          trigger: 'blur',
        },
        roleDesc: {
          required: true,
          message: '请输入角色描述',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    //    获取角色列表
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.messages.error('获取角色列表失败')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 关闭添加窗口时重置表单
    closeAddRoleDialog() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 关闭修改窗口
    closeEditRoleDialog() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 确定添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功~')
        this.addRoleDialog = false
        this.getRoleList()
      })
    },
    // 打开修改角色窗口
    async showEditRoleDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败~')
      }
      this.$message.success('查询角色成功')
      this.editRoleForm = res.data
      this.editRoleDialog = true
    },
    // 确定修改角色信息
    editRole() {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败~')
        }
        this.$message.success('修改角色信息成功~')
        this.editRoleDialog = false
        this.getRoleList()
      })
    },
    // 操作-》删除角色
    async removeRole(id, roleName) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除角色'" + roleName + "',确定继续吗？",
        '删除角色提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // console.log(confirmResult)
      if (confirmResult == 'cancel') {
        return this.$message.info("您已取消删除角色'" + roleName + "'")
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色'" + roleName + "'失败~")
      }
      this.$message.success("您已成功删除了角色'" + roleName + "'")
      this.getRoleList()
    },
    // 根据权限id删除权限
    async removeRightById(authName, role, rightId) {
      const confirmResult = await this.$confirm(
        "确定删除该角色下的'" + authName + "'权限吗？",
        '删除角色提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('您已取消了删除权限' + authName)
      }
      // console.log('确定删除权限\''+authName+'\'')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败~')
      }
      this.$message.success("您已成功删除权限'" + authName + "'~")
      // this.getRoleList()
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightsDialog(role) {
      this.roleId=role.id
      // 递归获取三级权限节点的id
      this.getDefIdKeyList(role,this.defIdKey)
      this.setRightsDialog = true
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('查询权限数据失败~')
      }
      this.setRightsList = res.data
      console.log(this.setRightsList)
    },
    //通过递归的方式获取角色下所有三级权限的id保存到defIdKey数组中
    getDefIdKeyList(node,arr){
      // 如果不包含children则是三级权限
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefIdKeyList(item,arr)
      });
    }, 
    // 关闭分配权限对话框
     closeSetRightsDialog(){
       this.defIdKey=[]
     },
    // 确定分配权限
    async setRights() {
      // 获取选中状态和选中状态节点id
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr=keys.join()
      const {data:res} =await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败~')
      }
      this.$message.success('分配权限成功~')
      this.getRoleList()
      this.setRightsDialog=false
    },
    

  },
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.bdtop {
  border-top: solid 1px #eee;
}
.bdbottom {
  border-bottom: solid 1px #eee;
}
// 垂直居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>