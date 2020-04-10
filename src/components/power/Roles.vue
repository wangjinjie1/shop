<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
        <el-button type="success">添加角色</el-button>
        </el-col>
      </el-row>
          <el-table
      :data="rolesList"
      style="width: 100%">
      <!-- 扩展列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <!-- 一级权限 -->
          <el-row :class="['bottomline', key1 ===0 ? 'topline' : '', 'vcenter']" v-for = "(item1, key1) in scope.row.children" :key='item1.id'>
            <el-col :span="6">
              <el-tag closable @close='delUserRightsById(scope.row, item1.id)'> {{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 二级与三级权限渲染区 -->
          <el-col :span="18">
            <el-row :class="[key2 === 0 ? '' : 'topline', 'vcenter']" v-for="(item2, key2) in item1.children" :key="item2.id">
              <el-col :span="4">
                <el-tag closable @close='delUserRightsById(scope.row, item2.id)' type="success">
                  {{item2.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 三级权限渲染 -->
              <el-col :span="20">
                <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close='delUserRightsById(scope.row, item3.id)'>
                  {{item3.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
            </el-row>
          </el-col>
          </el-row>
          <!-- <pre>{{scope.row}}</pre> -->
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="roleName" label="角色名称">
      </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述">
      </el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-row>
            <el-button icon="el-icon-edit" circle type="primary">编辑</el-button>
            <el-button icon="el-icon-delete" circle type="warning">删除</el-button>
            <el-button icon="el-icon-star-off" circle type="success" @click="showSetRigthDialog(scope.row)">分配权限</el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
  title="提示"
  :visible.sync="SetRigthDialogVisible"
  width="50%"
  @close='setRigthDialogClosed'>
  <!-- 树形空间 -->
  <el-tree :data="rigthsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys='defKeys' ref='treeRef'></el-tree>
  <span slot="footer">
    <el-button @click="SetRigthDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      SetRigthDialogVisible: false,
      // 所有权限数据
      rigthsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点 id 数组
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    async delUserRightsById (role, rightId) {
      const info = await this.$confirm('是否删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        // console.log(err) 点击取消按钮时 err 为cancal字符串
        this.$message.error(err)
      })
      if (info !== 'confirm') {
        return this.$message.error('删除角色失败')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      role.children = res.data
    },
    async showSetRigthDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rigthsList = res.data
      // console.log(this.rigthsList)
      // 递归获取三级节点 id
      this.getReafKeys(role, this.defKeys)
      this.SetRigthDialogVisible = true
    },
    // 通过递归的方式获取角色下所有三级权限的 id 并保存到 defKeys
    getReafKeys (node, arr) {
      // 判断是否为三级节点，若是则直接压入数组
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getReafKeys(item, arr))
    },
    // 关闭对话框时清空数组
    setRigthDialogClosed () {
      this.defKeys = []
    },
    // 为角色分配权限
    async allotRights () {
      const keys = [
        // ...为展开运算符
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idstr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idstr })
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.SetRigthDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.topline{
    border-top: 2px solid #eee
}
.bottomline{
    border-top: 2px solid #eee
}
// 垂直居中
.vcenter{
  display: flex;
  align-items: center;
}

</style>
