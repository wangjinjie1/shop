<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <el-table
            :data="userRightList"
            style="width: 100%"
            border
            stripe>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="authName" label="权限名称">
            </el-table-column>
            <el-table-column prop="path" label="路径">
            </el-table-column>
            <el-table-column prop="level" label="权限等级">
              <template slot-scope="scope">
                <!-- <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                <el-tag type="warning" v-else-if="scope.row.level === '1'">二级</el-tag>
                <el-tag type="success" v-else>三级</el-tag> -->
                <el-tag v-show="scope.row.level === '0'">一级</el-tag>
                <el-tag type="warning" v-show="scope.row.level === '1'">二级</el-tag>
                <el-tag type="success" v-show="scope.row.level === '2'">三级</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      userRightList: []
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败')
      }
      this.userRightList = res.data
      console.log(this.userRightList)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
