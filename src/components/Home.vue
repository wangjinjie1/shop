<template>
    <el-container class="home-container">
         <!-- 头部区 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="无法显示">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="iscollapse ? '64px' : '200px'">
                <!-- 折叠条 -->
                <div class="fold" @click="foldCollapse">| | |</div>
                <el-menu
                background-color="#252526"
                text-color="#fff"
                active-text-color="#007ACC"
                unique-opened
                :collapse='iscollapse'
                router
                :default-active='activePath'>
                <!-- 一级菜单 -->
                <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                    <!-- 一级菜单模板区 -->
                    <template slot="title">
                    <!-- 图标 -->
                    <i :class="iconobj[item.id]"></i>
                    <!-- 文本 -->
                    <span>{{item.authName}}</span>
                    </template>
                    <!-- el中的router属性-->
                    <el-menu-item :index=" '/' + subItem.path " v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                        <!-- 二级菜单模板区 -->
                        <template slot="title">
                        <!-- 图标 -->
                        <i class="el-icon-menu"></i>
                        <!-- 文本 -->
                        <span>{{subItem.authName}}</span>
                        </template>
                    </el-menu-item>
                </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 主体区 -->
            <el-main>
              <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      activePath: '',
      iscollapse: false,
      menulist: [],
      iconobj: {
        '103': 'iconfont icon-users',
        '125': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      }
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      // { data: res }为解构赋值操作，将得到的data数据重命名为res
      const { data: res } = await this.$http.get('menus')
      console.log(res)// 等价于const result，console.log(result.data)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮，折叠与展开
    foldCollapse () {
      this.iscollapse = !this.iscollapse
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.iconfont{
    margin-right: 10px;
}
.home-container{
    height: 100%;
}
.el-header{
    background-color: #1E1E1E;
    display: flex;
    justify-content: space-between;
    align-items: center;// 使按钮居中
    color: rgba(243, 243, 243, 0.171);
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin: 0px 10px;
        }
    }
}
.el-aside{
    background-color: #252526;
    .el-menu{
      border-right: none;
    }
}
.fold{
  background-color: #383838;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
}
</style>
