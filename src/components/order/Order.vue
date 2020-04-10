<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList">
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
          <el-tag type="success" v-else>付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="">
            <el-button icon="el-icon-edit" circle type="primary" @click="cityShow"></el-button>
            <el-button type="warning" icon="el-icon-location" circle @click="progressShowDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <el-dialog
    @close='resetAddressDialog'
    title="修改地址"
    :visible.sync="showCityVisible"
    width="50%">
    <el-form :model="showCityForm" :rules="showCityFormrules" ref="showCityFormRefs" label-width="100px">
      <el-form-item label="省市区/县" prop="address1">
        <el-cascader :options="citydata" v-model="showCityForm.address1"></el-cascader>
      </el-form-item>
      <el-form-item label="详细地址" prop="address2">
        <el-input v-model="showCityForm.address2"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="showCityVisible = false">取 消</el-button>
        <el-button type="primary" @click="showCityVisible = false">确 定</el-button>
    </span>
    </el-dialog>
    <el-dialog
    title="物流进度条"
    :visible.sync="progressDialogVisible"
    width="50%">
    <el-timeline>
      <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
      </el-timeline-item>
    </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: '',
      showCityVisible: false,
      showCityForm: {
        address1: [],
        address2: ''
      },
      showCityFormrules: {
        address1: [ { required: true, message: '请选择省市区/县', trigger: 'blur' } ],
        address2: [ { required: true, message: '请填写详细地址', trigger: 'blur' } ]
      },
      citydata: citydata,
      progressInfo: [],
      progressDialogVisible: false
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
    },
    cityShow () {
      this.showCityVisible = true
    },
    resetAddressDialog () {
      this.$refs.showCityFormRefs.resetFields()
    },
    async progressShowDialog () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流星系失败')
      }
      console.log(res.data)
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
</style>
