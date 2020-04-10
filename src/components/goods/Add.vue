<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="消息提示的文案"
        type="info"
        center
        show-icon
        :closable="false">
      </el-alert>
      <!-- 步骤条区域,activeIndex - 0将字符串变为数组 -->
      <el-steps :space="200"
      :active="activeIndex - 0"
      finish-status="success" align-center>
        <el-step title="基本信息" ></el-step>
        <el-step title="商品参数" ></el-step>
        <el-step title="商品属性" ></el-step>
        <el-step title="商品图片" ></el-step>
        <el-step title="商品内容" ></el-step>
        <el-step title="完成" ></el-step>
      </el-steps>
      <!-- Tabs标签页区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addrFormRef" label-width="100px"  label-position="top" >
        <el-tabs :tab-position="tabPosition" v-model="activeIndex" :before-leave='beforeTagsEnter' @tab-click='tabClicked'>
          <el-tab-pane label="基本信息" name='0'>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
                  <el-cascader
                    v-model="addForm.goods_cat"
                    :options="goodCateList"
                    expand-trigger="hover"
                    :props="goodCateListProps "
                    @change="handleChange">
                  </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name='1'>
            <el-form-item :label="item.attr_name" v-for="item in manyTabsList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="value" v-for="(value, key) in item.attr_vals" :key="key" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name='2'>
            <el-form-item :label="item.attr_name" v-for="item in onlyTabsList" :key="item.attr_id">
              <el-input v-model="item.attr_vals">
              </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name='3'>
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handerSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name='4'>
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="margin_button" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%">
    <img :src="previewUrl" class="picCenter">
  </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 步骤条索引
      activeIndex: '0',
      // 标签页导航区位置
      tabPosition: 'left',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: '',
        // 图片路径数组
        pics: [],
        // 富文本编辑内容
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      goodCateList: [],
      goodCateListProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      manyTabsList: [],
      onlyTabsList: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewUrl: '',
      previewVisible: false
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  created () {
    this.getgoodsList()
  },
  methods: {
    async getgoodsList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      // console.log(res.data)
      this.goodCateList = res.data
    },
    handleChange () {
    // console.log(this.addForm.goods_cat)
    },
    beforeTagsEnter (activename, oldactivename) {
      if (oldactivename !== 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数失败')
        }
        this.manyTabsList = res.data
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals === 0 ? [] : item.attr_vals.split(',')
        })
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数失败')
        }
        this.onlyTabsList = res.data
        console.log(res.data)
      }
    },
    // 图片预览效果
    handlePreview (file) {
      this.previewUrl = file.response.data.url
      this.previewVisible = true
    },
    // 图片移除效果
    handleRemove (file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tem_path
      // 2. 从 pics 数组中，找到这个图片的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.使用 splice 方法，把图片信息对象从 pics 数组中删除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功时间
    handerSuccess (response) {
      // 1.拼接得到一个图片信息对象
      const picinfo = { pic: response.data.tem_path }
      // 2.将图片信息对象push到pics
      this.addForm.pics.push(picinfo)
      console.log(this.addForm)
    },
    // 添加商品内容的商品介绍
    add () {
      this.$refs.addrFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写完整的商品信息')
        }
        // 执行添加业务逻辑
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数 attr_vals 为数组转化为字符串
        this.manyTabsList.forEach(item => {
          const info = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(info)
        })
        // 处理静态属性 attr_vals 为字符串
        this.onlyTabsList.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(info)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps{
  margin: 15px;
}
.picCenter{
  width: 100%;
}
.margin_button{
  margin: 15px 0px;
}
</style>
