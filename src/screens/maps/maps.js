import React,{ Component } from "react";
import { 
  View, 
  StyleSheet,
  Text,
  AsyncStorage, 
  TouchableOpacity
 } from "react-native";
import MapView, {PROVIDER_GOOGLE, Marker, Callout}  from "react-native-maps";
import { DEVICE_HEIGHT, DEVICE_WIDTH, baseColor } from "../../constants/mainSetting";
import autobind from "class-autobind";
import { requestTodayTaskLocation } from "../../apis/taskAPI";
import moment from "moment";
import axios from "axios";
import { TOKEN, CONTENT_TYPE, AUTHORIZATION, USER, GREEN, ZONE_TIME, RED, HOUR_FORMAT } from "../../constants/common";
import { Navigation } from "react-native-navigation";
import { COMPANY_INFO_SCREEN, MAP_SCREEN } from "../../constants/screen";



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
   

  _renderMarker(list) {
    let listMarkers = [], listStartTimeCompare = []
    Object.keys(list).map((key) => {
      let t = this._compareTimeToCurrent(list[key].list[0].startTime)
      if (t > 0) {
        listStartTimeCompare.push(t)
      }
    })
    Object.keys(list).map((key,index) => {
      let listViewTaskInfo = this._renderListTask(list[key].list)
      let time = this._compareTimeToCurrent(list[key].list[0].startTime)
      listMarkers.push(
        <Marker
          pinColor={(time === Math.min.apply(Math,listStartTimeCompare)) ? baseColor : RED }
          key={index}
          coordinate={{ 
            latitude: list[key].latitude,
            longitude: list[key].longitude
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
                   companyId: list[key].companyId, 
                   listTasks: list[key].list
                 },
               }
              })
            }}>
                <View style={styles.taskInfoContainer}>
                  <Text style={styles.textCompanyName}>{list[key].companyName}</Text> 
                  <Text style={styles.textLocationName}>{ 
                    list[key].address.length >= 35 ? 
                    list[key].address.substring(0, 34) + "..." 
                     : list[key].address
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

const mapStyle = [
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.sports_complex",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]