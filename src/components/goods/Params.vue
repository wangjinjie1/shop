<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
       <!-- 警告区  -->
       <el-alert
            title="注意: 只允许为第三级参数设置相关参数"
            type="warning"
            show-icon
            :closable = 'false'>
        </el-alert>
      <el-row class="margin_alert">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
          expand-trigger="hover"
          v-model="selectCateKeys"
          :options="cateList"
          :props="cateProps"
          @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
        <el-tabs v-model="activeName" @tab-click="handleTabsClick" class="tabs_color">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDisabled" type="success" @click="addDialogVisible=true">动态参数</el-button>
          <!-- 动态参数表格         -->
          <el-table :data="manyTableDate">
            <!-- 扩展列 -->
            <el-table-column type="expand">
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" circle @click="showDialogEdit(scope.row.attr_id)"></el-button>
                <el-button @click="deleteParams(scope.row.attr_id)" type="success" icon="el-icon-delete" circle ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"><el-button type="success" :disabled="isBtnDisabled" @click="addDialogVisible=true">静态属性</el-button>
          <!-- 静态属性表格         -->
          <el-table :data="onlyTableDate">
            <!-- 扩展列 -->
            <el-table-column type="expand">
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" circle @click="showDialogEdit(scope.row.attr_id)"></el-button>
                <el-button type="success" icon="el-icon-delete" circle @click="deleteParams(scope.row.attr_id)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close='addDialogClosedReset'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRulesRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close='editDialogClosedReset'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRulesRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectCateKeys: [],
      activeName: 'many',
      // 动态表格数据
      manyTableDate: [],
      // 静态表格数据
      onlyTableDate: [],
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑对话框
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选中变化，会触发 handleChange 函数
    handleChange () {
      this.getParamsList()
    },
    handleTabsClick () {
      this.getParamsList()
    },
    async getParamsList () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      }
      this.onlyTableDate = res.data
    },
    // 表单重置
    addDialogClosedReset () {
      this.$refs.addFormRulesRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRulesRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    async showDialogEdit (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosedReset () {
      this.$refs.editFormRulesRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRulesRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更改参数失败')
        }
        this.$message.success('更改参数成功')
        // console.log(res.data.attr_name)
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 删除按钮操作
    async deleteParams (attrId) {
      const result = await this.$confirm('此操作将永久删除参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.error('删除参数失败')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsList()
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 得到 select 框的id
    cateId () {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      }
      return null
    },
    // 动态赋值 dialog 文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态数据'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.margin_alert{
  margin: 15px;
}
</style>
