<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <div>
            <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear='getUserList'>
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 作用域插槽 vue api-->
          <template slot-scope="scope">
            <!-- 用于显示整行数据 -->
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStatusChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" circle @click="editUser(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" circle @click="messageBoxdelUser(scope.row.id)"></el-button>
            <!-- 修改角色按钮    -->
             <el-tooltip  effect="dark" content="修改角色" placement="top">
              <el-button type="warning" icon="el-icon-star-off" circle @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryinfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%" @close='addDialogReset'>
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部去 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editUserdialogVisible"
      width="50%" >
      <el-form :model="editForm" :rules="addFormrules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
          <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
          <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserdialog">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="setUserdialogVisible"
      width="50%"
      @close='closedDialogReset'
      >
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          <el-select v-model="selectRoleid" placeholder="请选择">
          <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleinfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义校验规则，校验邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 自定义校验规则，校验手机号
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        callback()
      }
      callback(new Error('请输入合法手机号'))
    }
    return {
      // 获取用户列表参数对象
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      editForm: [],
      // 获取用户
      userlist: [],
      total: 0,
      // 控制用户对话框的显示和隐藏
      dialogVisible: false,
      // 编辑用户对话框的显示和隐藏
      editUserdialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormrules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要分配角色的信息
      userInfo: {},
      setUserdialogVisible: false,
      // 所有角色的数据列表
      roleList: [],
      // 修改角色对话框中的selectid
      selectRoleid: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户
    async getUserList () {
      // get方法用params传参
      const { data: res } = await this.$http.get('users', { params:
        this.queryinfo }
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取user失败')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件,当前处于第几页
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryinfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryinfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 状态的改变
    async userStatusChanged (userinfo) {
      // console.log(userinfo)
      // ``中的为模板字符串
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更改状态失败')
      }
      this.$message.success('成功更改状态')
    },
    // 重置对话框
    addDialogReset () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.getUserList()
        this.dialogVisible = false
      })
    },
    // 查询并得到用户
    async editUser (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.$message.success('查询成功')
      this.editForm = res.data
      this.editUserdialogVisible = true
    },
    // 编辑用户
    editUserdialog () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        this.editUserdialogVisible = false
        this.getUserList()
        return this.$message.success('修改用户信息成功')
      })
    },
    // 弹框提示是否删除用户
    async messageBoxdelUser (id) {
      // this.$confirm返回的为一个promise对象
      // 确定按钮点击之后返回的为 confirm 字符串
      // 取消按钮点击之后返回的为 cancel 字符串
      const info = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (info !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.getUserList()
      return this.$message.success('删除用户成功')
    },
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 显示对话框之前获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setUserdialogVisible = true
    },
    // 点击按钮分配角色
    async saveRoleinfo () {
      if (!this.selectRoleid) {
        return this.$message.info('请选择要分配角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleid })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setUserdialogVisible = false
    },
    closedDialogReset () {
      this.selectRoleid = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
