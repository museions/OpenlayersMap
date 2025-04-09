
<template>
  <div class="content_trace">
      <div class="fullScreen">
          <div @click="butClick()">
              <i class="iconfont icon-quanping"></i>
          </div>
      </div>
      <div id="side_bar">
          <el-cascader v-model="formData.deviceNo" :options="selectTree"
              :props="{ value: 'deviceNo', label: 'name', children: 'childrenList', emitPath: false, }"
              :show-all-levels="false" filterable placeholder="请选择车辆"></el-cascader>
          <div class="calFlex">
              <my-calendar :lunar="calendar.lunar" range :zero="true" :value="calendar.value" @select="select_calendar" />
          </div>
          <div class="search_bottom">
              <div class="row">
                  <div>开始日期</div>
                  <div class="date">{{ startDate }}</div>
                  <el-time-picker v-model="startTime" placeholder="开始时间" />
              </div>
              <div class="row">
                  <div>结束日期</div>
                  <div class="date">{{ endDate }}</div>
                  <el-time-picker v-model="endTime" placeholder="结束时间" />
              </div>
              <div class="operation">
                  <el-button size="mini" style="width: 98%; margin-top: 5px" type="primary" @click="getPointList">
                      查询轨迹
                  </el-button>
                  <!-- <el-button size="mini" style="width: 98%; margin-top: 5px" type="success" @click="playTraceAnimate">
                      轨迹回放
                  </el-button>
                  <el-button v-if="animating" size="mini" style="width: 98%; margin-top: 5px" type="danger"
                      @click="stop()">
                      停止回放
                  </el-button>
                  <el-button v-else size="mini" style="width: 98%; margin-top: 5px" type="danger" @click="startPlay">
                      继续播放
                  </el-button> -->
              </div>
          </div>
      </div>
      <div id="con">

          <div class="map_trace">
              <div id="map_trace" />
              <div id="bd_popup" class="ol-popup">
                  <div class="popup_title">
                      <b>{{ nodeItem.carNo }}</b>
                      <a id="popup-closer" href="javascript:;" class="el-icon-close" @click.stop="hiddenPopup" />
                  </div>

              </div>
              <div class="car_info">
                  <div class="infoWindow">
                      <ul>
                          <li>
                              <p>行驶里程</p>
                              <p>{{ playBackData.mileage || 0 }}km</p>
                          </li>
                          <li>
                              <p>在线时长</p>
                              <p>{{ playBackData.onlineDuration || 0 }} h</p>
                          </li>
                          <li>
                              <p>运行时长</p>
                              <p>{{ playBackData.runTime || 0 }} h</p>
                          </li>
                          <li>
                              <p>离线时长</p>
                              <p>{{ playBackData.offlineDuration || 0 }} h</p>
                          </li>
                      </ul>
                      <div class="trends">
                          <p>车速: <span>{{ carSpeed || 0 }}</span>km/h | 最高: <span>{{ playBackData.maxSpeed || 0
                          }}</span>km/h | 最低: <span>{{
  playBackData.minSpeed || 0 }}</span>km/h</p>
                          <p>时间: {{ currentTime }}</p>
                      </div>
                      <!-- <p style="font-size: 15px">
                          车辆位置:{{ carItem.addr }}
                      </p>
                      <template v-if="!carItem.showType">
                          <p><b>GPS时间</b>:{{ usuallyTIme(carItem.time) }}</p>
                          <p><b>速度</b>:{{ carItem.speed || 0 }} km/h</p>
                          <p><b>油量</b>:{{ carItem.currentOil || 0 }} L</p>
                          <p><b>漏油报警</b>:{{ carItem.oilSpill ? '报警' : '正常' }}</p>
                          <p>
                              <b>车辆状态</b>:{{ carItem.accOn ? 'ACC点火' : 'ACC熄火' }}
                          </p>
                      </template>
                      <template v-else>
                          <p><b>时间</b>:{{ usuallyTIme(carItem.time) }}</p>
                          <p><b>速度</b>:{{ carItem.speed || 0 }} KM/H</p>
                          <p><b>油量</b>:{{ carItem.currentOil || 0 }} L</p>
                          <p>
                              <b>状态</b>:
                              {{
                                  carItem.batteryLevel ? carItem.batteryLevel + '%' : '0%'
                              }}电量&emsp; {{ carItem.accOn ? 'ACC点火' : 'ACC熄火' }}
                          </p>
                      </template> -->
                  </div>
              </div>
              <!-- 卫星图切换 -->
              <div class="mapChange">
                  <el-button v-if="menuItem" @click="$router.push('/base/element')">围栏管理</el-button>
                  <el-button @click="mapChange">卫星</el-button>
              </div>
              <!-- 回放操作 -->
              <div class="play-content">
                  <div class="play">
                      <!-- <el-image v-if="isFinish" :src="require('@/assets/img/play.png')" fit="contain" @click="playTraceAnimate"></el-image> -->
                      <template>
                          <el-image v-if="!animating" :src="require('@/assets/img/play.png')" fit="contain"
                              @click="startPlay"></el-image>
                          <el-image v-else :src="require('assets/img/pause.png')" fit="contain"
                              @click="stop()"></el-image>
                      </template>
                  </div>
                  <div class="speed">
                      <span>慢</span>
                      <el-slider v-model="speedSlide" :min="1" :max="10" />
                      <span>快</span>
                  </div>
                  <div class="schedule">
                      <el-slider v-model="progress" :step="1"
                          :max="Array.isArray(pointList) && pointList.length ? pointList.length-1 : 0"
                          :format-tooltip="formatTooltip" @input="progressInput"/>
                  </div>
              </div>
              <!-- 起点和终点位置信息 -->
              <div class="address_box" v-if="isAddress">
                  <div class="icon"><i class="el-icon-close" @click="isAddress = false"></i></div>
                  <ul>
                      <li>
                          <div class="start_point">起</div>
                          <div class="add_info">
                              <p>时间: {{ playBackData.beginTime }}</p>
                              <p>位置: {{ playBackData.beginAddress }}</p>
                          </div>
                      </li>
                      <li>
                          <div class="end_point">终</div>
                          <div class="add_info">
                              <p>时间: {{ playBackData.endTime }}</p>
                              <p>位置: {{ playBackData.endAddress }}</p>
                          </div>
                      </li>
                  </ul>
              </div>

          </div>
          <div id="info" :style="tableStyle">
              <div class="info_title">
                  <p>位置数据 ({{ totalCount }})</p>
                  <ul>
                      <li>
                          <el-button type="primary" size="mini" icon="el-icon-arrow-up"
                              @click="tableClick('up')"></el-button>
                      </li>
                      <li>
                          <el-button type="primary" size="mini" icon="el-icon-arrow-down"
                              @click="tableClick('down')"></el-button>
                      </li>
                  </ul>
              </div>
              <el-table border :data="tableData">
                  <el-table-column align="center" type="index" label="序号" width="80" />
                  <el-table-column align="center" label="时间" prop="dataTime" width="200" />
                  <el-table-column align="center" label="ACC状态" prop="accStatus" width="200" />
                  <el-table-column align="center" label="地理位置" prop="address" show-overflow-tooltip />
                  <el-table-column align="center" label="速度(km/h)" width="140" prop="speed" />
                  <el-table-column align="center" label="经纬度" prop="longitude" show-overflow-tooltip width="240">
                      <template slot-scope="{row}">
                          {{ row.longitude+' , '+row.latitude }}
                      </template>
                  </el-table-column>

                  <el-table-column align="center" label="方向" width="100" prop="direction">
                      <template slot-scope="{row}">
                          {{ row.direction }}°
                      </template>
                  </el-table-column>

              </el-table>
              <div class="el-pagination-container common_r_pagination">
                  <el-pagination small layout="total, prev, pager, next, jumper" :current-page="formData.pageNo"
                      :page-size="formData.pageSize" :total="totalCount" @current-change="changeMainCurrent">
                  </el-pagination>

              </div>

          </div>

      </div>

  </div>
</template>

<script>
import Map from 'ol/Map'
import View from 'ol/View'
import VectorSource from 'ol/source/Vector'
import { defaults } from 'ol/control/defaults'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
import Icon from 'ol/style/Icon'
import { LineString, Point } from 'ol/geom'
import { getVectorContext } from 'ol/render'
// import tileMapLayers from '@/assets/oljs/tileMapLayer' // 天地图底图
import Overlay from 'ol/Overlay'

/* eslint-disable no-new-object,no-unused-vars,no-unused-expressions,no-lonely-if,no-undef,new-cap */

import moment from 'dayjs'

// import myCalendar from '@/components/myCalendar.vue'
import arrowPng from '@/assets/loc.png'
import car from '@/assets/marker.png'
// import fullScreen from '@/mixin/fullScreen'
import { mapMutations, mapState } from 'vuex'
import { trackdata } from './trackPlayData' 
console.log('trackdata', trackdata);

let trackAllCol = {}
let moveTrackEvent = null
let olMapTrackLayers = {}
const listenEventTrackIds = {}
const lineStyles = {
  color: ['#fccc9e', '#fc00d2'],
  lines() {
      return function(feature, resolution) {
          const geometry = feature.getGeometry()
          const styles = [
              new Style({
                  stroke: new Stroke({
                      color: '#409eff',
                      width: 5
                  })
              })
          ]
          geometry.forEachSegment(function(start, end) {
              const dx = end[0] - start[0]
              const dy = end[1] - start[1]
              const rotation = Math.atan2(dy, dx)
              // 给箭头设置在中间解决不好点击问题
              const lines = [start, end]
              const lines4326 = new LineString(lines)
              const centerCoordinate = lines4326.getCoordinateAt(0.5)
              styles.push(
                  new Style({
                      geometry: new Point(centerCoordinate),
                      image: new Icon({
                          src: arrowPng, // 线路箭头图标
                          anchor: [0.75, 0.5],
                          rotateWithView: false,
                          rotation: -rotation,
                          scale: 0.3
                      })
                  })
              )
          })

          return styles
      }
  }
}
let itemIndex = 0
let interval
let distance = 0
export default {
  name: 'Trace',
  mixins: [
    // fullScreen
],
  components: {
    //   myCalendar
  },

  data() {
      return {
          urlNo: this.$route.query.urlNo,
          index: 0,
          calendar: {
              value: this.DateToArray(Date.now()), // 默认日期今天
              lunar: false // 显示农历
          },
          tableHeight: document.body.clientHeight / 2.3 + 'px',
          formData: {
              searchKey: '',
              deviceNo: '',

              startTime: '',
              endTime: '',
              isTracing: false,
              pageNo: 1,
              pageSize: 3

          },
          startDate: moment(new Date()).format('YYYY-MM-DD'),
          endDate: moment(new Date()).format('YYYY-MM-DD'),
          startTime: new Date(new Date(new Date().toLocaleDateString()).getTime()),
          endTime: new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1000),
          totalCount: 0,
          pointList: [],
          carTrace: require('@/assets/img/car.png'),
          startIcon: require('@/assets/img/start.png'),
          endIcon: require('@/assets/img/end.png'),
          car: require('@/assets/img/onGreen.png'),
          //
          olMap: null,
          layersMap: {},
          mapProjectList: [],
          nodeItem: {},
          overlay: null,
          tk: '4c2df5d3a03117cd42a3e293af67ebcc',
          animating: false,
          cutIndex: 1,
          progress: 0, // 播放进度
          infoCarData: [],
          carItem: {},
          selectTree: [],
          tableData: [],
          playBackData: [],
          isPlay: false,
          speedSlide: 3,
          scheduleSlide: 0,
          currentTime: '', // 实时小车位置的时间
          carSpeed: 0, // 实时小车速度
          isAddress: false, // 是否显示起始地址信息
          tableStatus: '2', // 当前表格数据展示状态 (全屏:'1',半屏:'2',隐藏:'3')
          tableStyle: {},
          mapTyped: 'white',
          DayTileMapLayer: [],
          mapData: {
              mapCiaLayer: 'cia',
              mapCiaUrl: 'http://t0.tianditu.gov.cn/cia_w/wmts?tk=965dff51461d961ce7f078b99ecac627',
              mapCvaLayer: 'cva',
              mapCvaUrl: 'http://t0.tianditu.gov.cn/cva_w/wmts?tk=965dff51461d961ce7f078b99ecac627',
              mapImgLayer: 'img',
              mapImgUrl: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=965dff51461d961ce7f078b99ecac627',
              mapVecLayer: 'vec',
              mapVecUrl: 'http://t0.tianditu.gov.cn/vec_w/wmts?tk=965dff51461d961ce7f078b99ecac627'
          }

      }
  },
  computed: {
      ...mapState(['menuItem']),
      usuallyTIme() {
          return function(timestamp) {
              return moment(new Date(timestamp)).format('YYYY年MM月DD日 hh时mm分')
          }
      },
      getPointListInfo() {
          return this.pointList.map(x => x.info)
      },
      formatTooltip() {
          return function(value) {
              if (Array.isArray(this.pointList) && this.pointList.length) {
                  `${Math.trunc(value / this.pointList.length * 100) || 0}%`
              } else {

              }
          }
      }
  },
  watch: {
      cutIndex: {
          handler(val) {
              this.progress = val
          }
      }
  },
  created() { },
  mounted() {
      if (this.$route.query.carNo) {
          this.formData.deviceNo = this.$route.query.carNo
      }
      this.$nextTick(function() {
          this.initMap()
      })
      this.getSelectTree()
      this.setMenuItem()
  },

  beforeDestroy() {
      clearInterval(interval)
      for (const i in this.layersMap) {
          if (this.layersMap[i]) {
              this.layersMap[i].getSource().clear()
              this.olMap.removeLayer(this.layersMap[i])
              this.layersMap[i].dispose()
          }
      }
      this.disposeEvent()
      if (this.olMap) {
          this.olMap.setTarget(null)
          this.olMap.dispose()
      }
      this.stopClear()
      olMapTrackLayers = {}
  },
  methods: {
      ...mapMutations(['setMenuItem']),
      mapChange() { // 地图底图切换卫星
          this.mapTyped === 'white' ? this.mapTyped = 'black' : this.mapTyped = 'white'

          this.olMap.removeLayer(this.DayTileMapLayer[0])
          this.olMap.removeLayer(this.DayTileMapLayer[1])

          this.DayTileMapLayer = []
        //   this.DayTileMapLayer = tileMapLayers(this, this.mapTyped)
          this.olMap.addLayer(this.DayTileMapLayer[0])
          this.olMap.addLayer(this.DayTileMapLayer[1])
      },
      initMap() {
        //   this.DayTileMapLayer = tileMapLayers(this) // 天地图底图
          this.olMap = new Map({
              layers: [...this.DayTileMapLayer],
              target: 'map_trace',
              controls: defaults({
                  attribution: false,
                  zoom: false,
                  rotate: false
              }).extend([]),
              view: new View({
                  center: [120.186511, 30.25898],
                  zoom: 10,
                  maxZoom: 18,
                  projection: 'EPSG:4326'
              })
          })

          // 创建Overlay弹出层绑定DOM
          this.overlay = new Overlay({
              element: document.getElementById('bd_popup'),
              autoPan: false,
              positioning: 'bottom-center',
              offset: [0, -10],
              animation: {
                  duration: 250
              }
          })
          // 新增到map
          this.olMap.addOverlay(this.overlay)

          // 创建track 图层
          if (!olMapTrackLayers.track) {
              olMapTrackLayers.track = new VectorLayer({
                  source: new VectorSource(),
                  zIndex: 6
              })
              this.olMap.addLayer(olMapTrackLayers.track)
          } else {
              olMapTrackLayers.track.getSource().clear()
          }
      },
      getSelectTree() {
          this.$ajax.post('/admin/biz/trace/selectTree').then(res => {
              if (res.code !== 200) return false
              this.selectTree = res.data
          })
      },
      disposeEvent() {
          if (listenEventTrackIds.map) {
              listenEventTrackIds.map = this.olMap.removeEventListener(
                  'click',
                  this.clickEvent
              )
          }
      },
      stopTrace() {
          if (itemIndex > 1) {
              this.animating = false
          }
          clearInterval(interval)
      },
      continueTrace() {
          this.animating = true
          this.setTraceAnimate(this.pointList)
      },
      getPointList() {
          // 对时间进行格式化处理
          this.formData.startTime = `${this.startDate} ${moment(this.startTime).format('HH:mm:ss')}`
          this.formData.endTime = `${this.endDate} ${moment(this.endTime).format('HH:mm:ss')}`

          if (this.$moment(this.formData.startTime).valueOf() > this.$moment(this.formData.endTime).valueOf()) {
              this.$message.warning('开始时间不能大于结束时间')
              return false
          }
          if (this.$moment(this.formData.endTime).valueOf() - this.$moment(this.formData.startTime).valueOf() > 432000000) {
              this.$message.warning('最大查询时间范围5天')
              return false
          }

          const self = this
          self.formData.isTracing = false

          itemIndex = 1
          this.hiddenPopup()
          this.stopClear()
          // 为了弹窗
          if (this.urlNo) {
              self.formData.no = this.urlNo
          }
          if (!this.formData.deviceNo) {
              return this.$message('请先选择车辆')
          }
          this.getTableData()
          this.playTraceAnimate()
      },
      findLonLatExtent(data, noTrans = false) {
          let [x1, y1, x2, y2] = [0, 0, 0, 0]
          // 左下 右上两点
          data.forEach((item, index) => {
              if (index === 0) {
                  x2 = x1 = item.longitude
                  y2 = y1 = item.latitude
              }
              if (item.longitude < x1) {
                  x1 = item.longitude
              } else if (item.longitude > x2) {
                  x2 = item.longitude
              }
              if (item.latitude < y1) {
                  y1 = item.latitude
              } else if (item.latitude > y2) {
                  y2 = item.latitude
              }
          })
          const res = [x1, y1, x2, y2].every(itx => itx > 0)
          if (res) {
              if (noTrans) {
                  return [x1, y1, x2, y2]
              } else {
                  return [[x1, y1], [x2, y2]].flat(1)
              }
          } else {
              return []
          }
      },
      // playTrace
      playTraceAnimate() {
          this.formData.isTracing = true
          if (olMapTrackLayers.track) {
              olMapTrackLayers.track.getSource().clear()
          }
          this.currentTime = ''
          clearInterval(interval)
          if (this.urlNo) {
              this.formData.no = this.urlNo
          }
          this.$ajax
              .post('/admin/biz/trace/playback', this.formData, null, { isLoading: true })
              .then((data) => {
                  if (data.code === 200) {
                      this.pointList = data.data.traceDataList
                      this.playBackData = data.data
                      if (Array.isArray(this.pointList) && this.pointList.length) {
                          this.isAddress = true
                          this.currentTime = this.pointList[0].dataTime
                          this.carSpeed = this.pointList[0].speed

                          const pointCenter = this.pointList[0]
                          // this.olMap.getView().animate({
                          //     center: [pointCenter.longitude, pointCenter.latitude],

                          //     duration: 500
                          // })
                          const resExtent = this.findLonLatExtent(this.pointList)
                          if (resExtent && resExtent.length) {
                              this.olMap.getView().fit(resExtent, {
                                  maxZoom: 17,
                                  duration: 300,
                                  padding: [20, 20, 20, 20]
                              })
                          }

                          this.showCatItem = true
                          this.drawTraceAll(this.pointList)
                          this.setTraceAnimate(this.pointList)
                      } else {
                          this.$message.warning('暂无轨迹信息')
                      }
                  }
              })
      },
      getPlayBackPoint() {
          if (olMapTrackLayers.track) {
              olMapTrackLayers.track.getSource().clear()
          }
          this.$ajax.post('/admin/biz/trace/playback', this.formData).then((res) => {
              if (res.code === 200) {
                  this.playBackData = res.data
                  this.pointList = res.data.traceDataList

                  if (Array.isArray(this.pointList) && this.pointList.length > 0) {
                      const pointCenter = this.pointList[0]

                      this.olMap.getView().animate({
                          center: [pointCenter.longitude, pointCenter.latitude],
                          // zoom: 14,
                          duration: 500
                      })

                      this.clearTraceLayerSource()
                      this.drawTraceAll(this.pointList)
                  }
              }
          })
      },
      getTableData() {
          this.$ajax.post('/admin/biz/trace/listPage', this.formData).then((res) => {
              if (res.code === 200) {
                  this.tableData = res.data.list
                  this.totalCount = res.data.totalCount
              }
          })
      },
      changeMainCurrent(current) {
          this.formData.pageNo = current
          this.getPointList()
      },
      clearTraceLayerSource() {
          if (olMapTrackLayers.track) {
              olMapTrackLayers.track.getSource().clear()
          }
      },
      getTableHeight() {
          this.tableHeight = this.$refs.table.offsetHeight - 2 // 2像素边框
      },
      select_calendar(start, end) {
          this.startDate = start
          this.endDate = end
          // this.getPointList()  //选中日期不自动查询
      },
      ArrayToDate(payLoad) {
          const data = [payLoad[0], payLoad[1] - 1, payLoad[2]]
          return moment(data)
      },
      DateToArray(DatePayLoad) {
          moment(DatePayLoad).toArray()
      },
      empty(row, column, cellValue, index) {
          return cellValue || '暂无数据'
      },
      alarm(row, column, cellValue, index) {
          return cellValue === false ? '正常' : '报警'
      },
      formatTime(row, column, cellValue, index) {
          return moment(cellValue).format('YYYY年MM月DD日 hh时mm分')
      },
      coordinate(row) {
          if (row.longitude && row.latitude) {
              return (
                  String(row.longitude).replace(/^(.*\..{2}).*$/, '$1') +
                  ' , ' +
                  String(row.latitude).replace(/^(.*\..{2}).*$/, '$1')
              )
          } else {
              return '暂无数据'
          }
      },

      //
      clickEvent(e) {
          const feature = this.olMap.forEachFeatureAtPixel(
              e.pixel,
              function(feature) {
                  return feature
              }
          )
          if (feature) {
              const attr = feature.getProperties()
              if (attr.type === 'traceAllShow') {
                  this.nodeItem = attr.info
                  this.overlay.setPosition([attr.point[0], attr.point[1]])
              } else {
                  this.hiddenPopup()
              }
          }
      },
      hiddenPopup() {
          this.overlay.setPosition(undefined)
      },

      drawTraceAll(carInfoList, traceAnimate) {
          const lines = []
          const pointCollect = []
          if (carInfoList.length > 1) {
              /* 只设置开头 结尾两个点 其他点位透明占位展示信息就好 */

              carInfoList.forEach((muaItem, muaIndex) => {
                  const point = [muaItem.longitude, muaItem.latitude]

                  lines.push(point)
                  // 点位与样式设置
                  const feature = new Feature({
                      geometry: new Point(point)
                  })

                  let icon = null
                  if (muaIndex === 0) {
                      icon = this.startIcon
                  } else if (muaIndex === this.pointList.length - 1) {
                      icon = this.endIcon
                  }

                  if (icon) {
                      feature.setStyle((_) => {
                          return [
                              new Style({
                                  image: new Icon({
                                      src: icon,
                                      anchor: [0.5, 0.7]
                                  })
                              })
                          ]
                      })
                  } else {
                      feature.setStyle((_) => {
                          return [
                              new Style({
                                  image: new CircleStyle({
                                      radius: 2,
                                      stroke: new Stroke({
                                          color: 'transparent',
                                          width: 2
                                      })
                                  })
                              })
                          ]
                      })
                  }

                  feature.setProperties({
                      type: 'traceAllShow',
                      point: muaItem
                  })

                  pointCollect.push(feature)
              })
              const lines4326 = new LineString(lines)
              const featureLine = new Feature(lines4326)
              featureLine.setStyle(lineStyles.lines())

              olMapTrackLayers.track
                  .getSource()
                  .addFeatures([featureLine, ...pointCollect])
          } else if (carInfoList.length === 1) {
              const point = carInfoList[0]

              const feature = new Feature({
                  geometry: new Point([point.longitude, point.latitude])
              })
              feature.setStyle((_) => {
                  return [
                      new Style({
                          image: new CircleStyle({
                              radius: 5,
                              fill: new Fill({
                                  color: '#ff0044'
                              }),
                              stroke: new Stroke({
                                  color: '#3498db',
                                  width: 1
                              })
                          })
                      })
                  ]
              })
              olMapTrackLayers.track.getSource().addFeature(feature)
          }
      },
      // 获得角度的函数
      getAngle(n, next) {
          let ret
          const w1 = (n.lat / 180) * Math.PI
          const j1 = (n.lng / 180) * Math.PI

          const w2 = (next.lat / 180) * Math.PI
          const j2 = (next.lng / 180) * Math.PI

          ret =
              4 * Math.sin((w1 - w2) / 2) ** 2 -
              (Math.sin((j1 - j2) / 2) * (Math.cos(w1) - Math.cos(w2))) ** 2
          ret = Math.sqrt(ret)

          // var temp = Math.sin(Math.abs(j1 - j2) / 2) * (Math.cos(w1) + Math.cos(w2));
          const temp = Math.sin((j1 - j2) / 2) * (Math.cos(w1) + Math.cos(w2))
          ret = ret / temp

          ret = (Math.atan(ret) / Math.PI) * 180
          ret += 90

          // 这里用如此臃肿的if..else是为了判定追踪单个点的具体情况,从而调整ret的值
          if (j1 - j2 < 0) {
              // console.log('j1<j2')
              if (w1 - w2 < 0) {
                  // console.log('w1<w2')
                  // ret
              } else {
                  // console.log('w1>w2')
                  ret = -ret + 180
              }
          } else {
              // console.log('j1>j2')
              if (w1 - w2 < 0) {
                  // console.log('w1<w2')
                  ret = 180 + ret
              } else {
                  // console.log('w1>w2')
                  ret = -ret
              }
          }
          return ret
      },

      setTraceAnimate(data) {
          if (data.length < 1) {
              this.$message({
                  message: data.msg,
                  type: 'error'
              })
              return false
          }

          if (data.length === 1) {
              this.clearTraceLayerSource()
          } else {
              this.cutIndex = 0
              // this.olMap.getView().setZoom(15)
              this.iterGj(this.cutIndex)
          }
      },
      iterGj(cutIndex) {
          // 创建trackCar 图层；或清楚 车辆残留数据；
          if (!olMapTrackLayers.trackCar) {
              olMapTrackLayers.trackCar = new VectorLayer({
                  source: new VectorSource(),
                  zIndex: 7
              })
              this.olMap.addLayer(olMapTrackLayers.trackCar)
          } else {
              olMapTrackLayers.trackCar.getSource().clear()
          }

          this.carSpeed = this.pointList[cutIndex].speed // 实时小车速度
          this.currentTime = this.pointList[cutIndex].dataTime // 实时小车时间

          if (Array.isArray(this.pointList) && this.pointList.length - 1 <= cutIndex) {
              trackAllCol.geoMakPoint.setCoordinates([this.pointList[cutIndex].longitude, this.pointList[cutIndex].latitude])
              this.stop(false)
              return false
          }
          const lineData = this.pointList.slice(cutIndex, cutIndex + 2)
          if (Array.isArray(lineData) && lineData.length && lineData.length >= 2) {
              this.carItem = lineData[0]?.info
              trackAllCol.speed = lineData[0]?.speed
              // 线段
              const lines = lineData.map(nuaItem => [nuaItem.longitude,
                  nuaItem.latitude])
              trackAllCol.lastLinesCoord = new LineString(lines)

              // 角度
              trackAllCol.rotation = Math.atan2((lineData[1].latitude - lineData[0].latitude), (lineData[1].longitude -
              lineData[0].longitude))
              // 点位

              trackAllCol.geoMakPoint = new Point(
                  [lineData[0].longitude, lineData[0].latitude]
              )
              trackAllCol.geoMakFeature = new Feature({
                  type: 'geoMarker',
                  geometry: trackAllCol.geoMakPoint
              })

              trackAllCol.geoMakFeature.setStyle(
                  new Style({
                      image: new Icon({
                          src: car,
                          rotation: trackAllCol.rotation ? -trackAllCol.rotation + Math.PI / 2 : 0
                      })
                  })
              )

              olMapTrackLayers.trackCar.getSource().addFeature(trackAllCol.geoMakFeature)
          }
      },
      progressInput(val) { // 拖动播放的位置实时更新小车位置
          this.cutIndex = val
          this.$nextTick(() => {
              if (Array.isArray(this.pointList) && this.pointList.length > 0) {
                  this.iterGj(val)
              }
          })
      },
      startPlay() {
          if (Array.isArray(this.pointList) && this.pointList.length) {
              if (this.pointList.length - 1 <= this.cutIndex) {
                  this.cutIndex = 0
                  trackAllCol.geoMakFeature && trackAllCol.geoMakFeature.setGeometry(null) // 此处会清除播放中的小车数据
                  this.playTraceAnimate()
              }
              this.start()
          }
      },
      start() {
          this.animating = true
          moveTrackEvent = olMapTrackLayers.trackCar.on('postrender', this.moveFeature)
          this.olMap.render()
          // if (trackAllCol.geoMakFeature && this.cutIndex < this.pointList.length) {
          //     trackAllCol.geoMakFeature.setGeometry(null) // 此处会清除播放中的小车数据
          // }
      },
      stop(gon) {
          if (olMapTrackLayers.trackCar) {
              olMapTrackLayers.trackCar.un('postrender', this.moveFeature)
          }

          moveTrackEvent = null
          // 继续调用
          if (gon) {
              this.cutIndex += 1

              setTimeout((_) => {
                  this.start()
              })
          } else if (this.formData.isTracing) {
              if (olMapTrackLayers.trackCar) {
                  olMapTrackLayers.trackCar.un('postrender', this.moveFeature)
              }
              this.animating = false
              trackAllCol.geoMakFeature.setGeometry(trackAllCol.geoMakPoint)
              if (olMapTrackLayers.trackCar && olMapTrackLayers.trackCar.getSource()) {
                  olMapTrackLayers.trackCar.getSource().clear()
                  if (trackAllCol.geoMakFeature) {
                      olMapTrackLayers.trackCar.getSource().addFeature(trackAllCol.geoMakFeature)
                  }
              }
          }
      },
      moveFeature(event) {
          if (Array.isArray(this.pointList) && this.pointList.length) {
              if (this.pointList.length - 1 <= this.cutIndex) {
                  olMapTrackLayers.trackCar.un('postrender', this.moveFeature)
                  this.animating = false

                  return false
              }
          }
          distance += 0.02 * (this.speedSlide ? this.speedSlide : trackAllCol.speed)
          // distance += 0.5
          // 0 - 1 ； 0 一段线的开头 1 一段线的结尾；
          // 点位位置更新 获取上下文
          const vectorContext = getVectorContext(event)
          // 获取 线段 此处距离的位置, 存储点位
          const currentCoordinate = trackAllCol.lastLinesCoord.getCoordinateAt(
              distance
          )
          // 根据小车所在的点位实时更新视图移动 需要的时候把下面打开
          // this.olMap.getView().setCenter(currentCoordinate, true)
          trackAllCol.geoMakPoint.setCoordinates(currentCoordinate)

          vectorContext.setStyle(
              new Style({
                  image: new Icon({
                      src: car,
                      rotation: trackAllCol.rotation ? -trackAllCol.rotation + Math.PI / 2 : 0
                  })
              })
          )

          vectorContext.drawGeometry(trackAllCol.geoMakPoint)

          // 如果超出线段了 开始下一个线段 绘制地图
          if (distance > 1) {
              distance = 0
              this.stop(true)
              return '此段结束'
          }

          this.olMap.render()
      },
      stopClear() {
          if (olMapTrackLayers.trackCar) {
              olMapTrackLayers.trackCar.un('postrender', this.moveFeature)
              moveTrackEvent = null
              olMapTrackLayers.trackCar.getSource().clear()
              trackAllCol = {}
              this.animating = false
          }
      },
      tableClick(type) { // 表格全屏展开等操作
          if (type === 'up') {
              switch (this.tableStatus) {
                  case '1':// 全屏

                      break
                  case '2': // 半屏
                      this.tableStatus = '1'
                      this.tableStyle = {
                          height: '100%'
                      }
                      this.formData.pageSize = 15
                      this.formData.pageNo = 1
                      this.getTableData()
                      break
                  case '3':// 隐藏
                      this.tableStyle = {
                          height: '265px'
                      }
                      this.tableStatus = '2'
                      break
              }
          } else {
              switch (this.tableStatus) {
                  case '1':// 全屏
                      this.tableStyle = {
                          height: '265px'
                      }
                      this.formData.pageSize = 3
                      this.formData.pageNo = 1
                      this.getTableData()
                      this.tableStatus = '2'
                      break
                  case '2': // 半屏
                      this.tableStatus = '3'
                      this.tableStyle = {
                          height: '38px'
                      }

                      break
                  case '3':// 隐藏

                      break
              }
          }
      }

  }
}
</script>

<style scoped lang="scss">
@import '~assets/css/calendar.css';
@import '~assets/css/trace.scss';

.ol-popup {
  position: relative;
  min-width: 200px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 2px 0px 0px 2px #d8d1d1;

  &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -16px;
      transform: translateX(-10px);
      border: 8px solid transparent;
      border-top-color: #3561f1;
  }

  .popup_title {
      display: flex;
      justify-content: space-between;
      height: 20px;

      b {
          padding-left: 5px;
          padding-top: 5px;
      }

      a {
          width: 20px;
          height: 20px;
          text-decoration: none;
          text-align: center;
          line-height: 20px;
      }
  }
}

.map_trace {
  position: relative;
}

.fullScreen {
  position: absolute;
  right: 30px;
  top: -40px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  i {
      font-size: 24px;
  }
}
.search_bottom{
  .date{
      width: 90px;
  }
  .el-date-editor.el-input, .el-date-editor.el-input__inner{
      width: 120px;
  }
}
</style>
