import React,{ Component } from "react";
import { 
  View, 
  StyleSheet,
  Text,
  AsyncStorage, 
 } from "react-native";
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from "react-native-maps";
import { DEVICE_HEIGHT, DEVICE_WIDTH, baseColor } from "../../constants/mainSetting";
import { TOKEN, CONTENT_TYPE, AUTHORIZATION, USER, ZONE_TIME, RED, HOUR_FORMAT } from "../../constants/common";
import { COMPANY_INFO_SCREEN, MAP_SCREEN } from "../../constants/screen";

import autobind from "class-autobind";
import { requestTodayTaskLocation } from "../../apis/taskAPI";
import moment from "moment";
import axios from "axios";
import { Navigation } from "react-native-navigation";

import mapStyle from "./mapStyle";

export default class Maps extends Component {
  
  constructor(props) {
    super(props)
    this.state={
      companyList:[],
      textInputValue: '',
    }
    autobind(this)        //bind all methods except some component lifecycle
  }

  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[AUTHORIZATION] =await AsyncStorage.getItem(TOKEN)
  }

  _setUserLocation() {
    navigator.geolocation.getCurrentPosition(
      pos => {
        let lat = parseFloat(pos.coords.latitude),
            lon = parseFloat(pos.coords.longitude)
           this.setState({
              camera: {
                center: {
                  latitude: lat,
                  longitude: lon 
                },
                pitch: 16,
                heading: 16,
                zoom: 12,
                altitude: 20
             }
           })
      },
      err => {
        console.log('err map: ', err);
      },
  )
}

  async componentDidMount() {
    this._getCompanyInfo()
    Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex }) => {
      if (selectedTabIndex === 1) {
        this._getCompanyInfo()
      }
    });
  }

  async _getCompanyInfo() {
    const userId = await AsyncStorage.getItem(USER.ID)
    axios.get(requestTodayTaskLocation(userId)).then(res => {
      let lats = [], lons = []
        if(res.data.length === 0) {
          this._setUserLocation()
        }
        else {
          res.data.forEach(companyData => {
            lats.push(companyData.latitude)
            lons.push(companyData.longitude)
          })
          const maxLat = Math.max(...lats), 
              maxLon = Math.max(...lons),
              minLat = Math.min(...lats),
              minLon = Math.min(...lons),  
              mLat = (maxLat + minLat) / 2,
              mLon = (maxLon + minLon) / 2
          this.setState({
            companyList: res.data,
            camera: {
              center: {
                latitude: mLat,
                longitude: mLon
              },
              pitch: 16,
              heading: 16,
              zoom: 12,
              altitude: 20
            }
          })
        }
    }).catch(err => { 
      this._setUserLocation()
    })
  }
  
  _compareTimeToCurrent(time) { 
    var current = moment(new Date()),
        timeM = moment(new Date(time.replace(ZONE_TIME,"Z"))),
        differenceInMs = timeM.diff(current ,"minutes")
        // console.log('time pass: ', time)
        // console.log('current time: ', current)
        // console.log('moment time: ', timeM)
    return differenceInMs
  }

  _renderListTask(listTask) { 
    let result = []
    listTask.forEach((t,i) => {
      let startTime = moment(t.startTime).format(HOUR_FORMAT).toString(),
          endTime = moment(t.endTime).format(HOUR_FORMAT).toString()
      let taskInfo = "Công việc " + (i + 1) + ": " + startTime + " - " + endTime + "\n " 
      let taskComponent = <Text style={styles.textTaskInfo}>{taskInfo}</Text>
      result.push(taskComponent)
    })
    return result
  }
   

  _renderMarker(listMark) {
    console.log('maker: ',listMark)
    let listMarkers = [], listMarkColorByTime = [], endTimePrevious = 0
    Object.keys(listMark).map((key,index) => {
      let endPos = listMark[key].list.length - 1
      //console.log('time: ', time)
      //console.log('list: ', listMark[key].list[0].startTime)
      let startTimeAtCompany = listMark[key].list[0].startTime,
          endTimeAtCompany = listMark[key].list[endPos].endTime,
          timeDiffFromStartTime = this._compareTimeToCurrent(startTimeAtCompany),
          timeDiffFromEndTime = this._compareTimeToCurrent(endTimeAtCompany),
          timeDiffFromPreEndtime = (endTimePrevious !== 0) ? this._compareTimeToCurrent(endTimePrevious) : 0
      console.log('time diff of com ' + index, timeDiffFromStartTime, timeDiffFromEndTime )
      if (
          (timeDiffFromStartTime < 0 && timeDiffFromEndTime > 0) ||  // start < current < end
          (timeDiffFromStartTime > 0 && timeDiffFromPreEndtime <= 0) // 0 <= current < start or preEnd < current < start
         ) {
        listMarkColorByTime.push(baseColor)
      }
      else {
        listMarkColorByTime.push(RED)
      }
      endTimePrevious = endTimeAtCompany
    })
    Object.keys(listMark).map((key,index) => {
      let listViewTaskInfo = this._renderListTask(listMark[key].list)
      listMarkers.push(
        <Marker
          pinColor={listMarkColorByTime[index]}
          key={index}
          coordinate={{ 
            latitude: listMark[key].latitude,
            longitude: listMark[key].longitude
          }}
          tracksViewChanges={false}
          showsMyLocationButton={true}>
            <Callout 
              tappable={false}
              tooltip={true}
              onPress={() => {
              Navigation.push(MAP_SCREEN.id, {
               component: {
                 id: COMPANY_INFO_SCREEN.id,
                 name: COMPANY_INFO_SCREEN.settingName,
                 passProps: {
                   companyId: listMark[key].companyId, 
                   listTasks: listMark[key].list
                 },
               }
              })
            }}>
                <View style={styles.taskInfoContainer}>
                  <Text style={styles.textCompanyName}>{listMark[key].companyName}</Text> 
                  <Text style={styles.textLocationName}>{ 
                    listMark[key].address.length >= 35 ? 
                    listMark[key].address.substring(0, 34) + "..." 
                     : listMark[key].address
                   }</Text>
                  <View style={{ justifyContent: "space-between" }}>
                     {listViewTaskInfo}
                  </View>
                </View>
            </Callout>
        </Marker>
      )
    });
    return listMarkers
  }

  render() {
    return (
     <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          showsUserLocation={true}
          customMapStyle={mapStyle}
          initialCamera={this.state.camera}
          moveOnMarkerPress={true}
          followsUserLocation={true} >
           {this._renderMarker(this.state.companyList)}
        </MapView>
      </View>  
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: DEVICE_HEIGHT,
    width: DEVICE_WIDTH,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'red',
  },
  textCompanyName: {
    fontFamily: "Roboto-Bold",
    fontSize: 15
  },
  textLocationName: {
    fontFamily: "Roboto-Regular",
    padding: 2,
    borderRadius: 10,
  }, 
  textTaskInfo: {
    fontFamily: "Roboto-Bold",
    fontSize: 15
  }, 
  taskInfoContainer: {
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 9,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white"
  }
});
