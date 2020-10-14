<template>
<div>
      <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
<!-- 2、为 ECharts 准备一个具备大小（宽高）的 DOM  -->
<div id="main" style="width: 850px;height:500px;"></div>
    </el-card>
</div>
</template>
<script>
// 1、导入echarts
import echarts from 'echarts'
// 使用lodash合并两个对象得到一个新对象
import _ from 'lodash'
export default {
  data() {
    return {
        // 需要合并的选项
        options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
//   此时页面上的所有元素（dom）都被渲染完毕
  async mounted(){
// 3、基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        
        // 4、指定图表的配置项和数据
       const {data:res}=await this.$http.get('reports/type/1')
        if(res.meta.status!==200){
            return this.messages.error('获取折线图失败~')
        }
        console.log(res.data)
        // 通过ladsh的merge函数：递归合并来源对象的自身和继承的可枚举属性到目标对象。 
        const result=_.merge(res.data,this.options)
        // 5、使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
  },
  methods: {},
}
</script>
<style lang="less" scoped>
</style>