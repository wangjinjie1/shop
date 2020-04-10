<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <!-- 添加商品按钮区   -->
        <el-col>
            <el-button @click="addCateDialogShow">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <tree-table class="treeTable" :data='cateList' :columns='columns' :expand-type='false'
      show-index
      :selection-type='false'
      index-text='#'
      border>
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
        <i class="el-icon-error" v-else style="color:red"></i>
      </template>
      <template slot="order" slot-scope="scope">
        <el-tag size= 'mini' v-if="scope.row.cat_level === 0">标签一</el-tag>
        <el-tag size= 'mini' type="success" v-else-if="scope.row.cat_level === 1">标签二</el-tag>
        <el-tag type="info" size= 'mini' v-else>标签三</el-tag>
      </template>
      <template slot="option" slot-scope="">
        <el-button type="primary" icon="el-icon-edit" size='mini'></el-button>
       <el-button type="success" icon="el-icon-delete" size='mini'></el-button >
      </template>
      </tree-table>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%" @close='addCateClosedReset'>
    <el-form :model="addCateruleForm" :rules="addCaterules" ref="addCateruleFormRef" label-width="100px">
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="addCateruleForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类" >
         <!-- options 用来指定数据源 -->
         <!-- props 用来指定匹配对象 -->
         <el-cascader
         expand-trigger="hover"
        v-model="selectedKeys"
        :options="parentsCateList"
        :props="CascaderProps"
        @change="parentCascaderChanged" clearable change-on-select></el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 用于提交1.6.1商品分类管理数据列表
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 控制添加商品对话框的显示与隐藏
      addCateDialogVisible: false,
      addCateruleForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类 dialog 中的select
      parentsCateList: '',
      selectedKeys: [],
      // 指定级联配置器的配置对象
      CascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      // console.log(res.data)
      this.cateList = res.data.result
      // console.log(res.data.result)
      this.total = res.data.total
      // console.log(res.data.total)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    addCateDialogShow () {
      this.getParentsCateList()
      this.addCateDialogVisible = true
    },
    async getParentsCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      // console.log(res.data)
      this.parentsCateList = res.data
    },
    parentCascaderChanged () {
    // 如果 selectedKeys 数组中的长度大于0 则说明选中了select
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id
        this.addCateruleForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]

        // 为当前分类的等级赋值
        this.addCateruleForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateruleForm.cat_pid = 0
        this.addCateruleForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateruleFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('categories', this.addCateruleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateClosedReset () {
      this.$refs.addCateruleFormRef.resetFields()
      this.selectedKeys = []
      this.addCateruleForm.cat_pid = 0
      this.addCateruleForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
</style>
