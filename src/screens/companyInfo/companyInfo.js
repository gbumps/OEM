import React,{ Component } from "react";
import { 
  View, 
  Text,
  AsyncStorage, 
  StyleSheet,
  TouchableOpacity
 } from "react-native";
import moment from "moment";
import { CheckBox } from "react-native-elements";
import { DEVICE_HEIGHT, DEVICE_WIDTH, baseColor} from "../../constants/mainSetting";
import autobind from "class-autobind";
import {Navigation} from "react-native-navigation";
import { CONTENT_TYPE, AUTHORIZATION, TOKEN, NO_IMAGE, HOUR_FORMAT } from "../../constants/common";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons"
import axios from "axios";
import { requestCompanyInfoAPI } from "../../api-service/companyAPI";
import getDirections from 'react-native-google-maps-directions'
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CollapsingToolbar from "react-native-collapsingtoolbar/src";
import { MAP_SCREEN, TASK_INFO_SCREEN, COMPANY_INFO_SCREEN } from "../../constants/screen";
import { requestTaskDetailURL } from "../../api-service/taskAPI";

export default class CompanyInfo extends Component {
  
  static get options() {
    return {
      statusBar: renderStatusBar(true),
      topBar: { 
        title: {
          text: ''
        },
        visible: "false",
        drawBehind: "true",
      },
    }    
  }

  constructor(props) {
    super(props)
    this.state = {
      company: {},
      tasks: [], 
      userLocation: {}
    }
    autobind(this)        
  }

  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[AUTHORIZATION] =await AsyncStorage.getItem(TOKEN)
    navigator.geolocation.getCurrentPosition(
      pos => {
        let lat = parseFloat(pos.coords.latitude),
            lon = parseFloat(pos.coords.longitude)
        this.setState({
          userLocation: { 
            latitude: lat,
            longitude: lon
          }
        })
      },  
      err => {
        console.log(err);
      }
    )
  }

  async componentDidMount() {
    const {companyId, listTasks} = this.props //taken from navigation
     axios.get(requestCompanyInfoAPI(companyId)).then(t => {
       this.setState({ 
         company: t.data
       })
     }).catch(err => console.log('err: ', err))
    if (listTasks.length !== 0) {
      const listTodayTasks = await Promise.all(
        listTasks.map(async (task) => {
          const t = await axios.get(requestTaskDetailURL(task.taskId))
          return t.data
        })
      )
      this.setState({
        tasks: listTodayTasks
      })
    }
  }

  handleGetDirections = () => {
    const data = {
      source: this.state.userLocation,
      destination: {
        latitude: this.state.company.latitude,
        longitude: this.state.company.longitude
      },
      params: [
        {
          key: "travelmode",
          value: "driving"        
        },
        {
          key: "dir_action",
          value: "navigate"       
        }
      ]
    }
    getDirections(data)
  }

  _calculateWorkTime(fromDate, toDate) {
    let startTime = moment(fromDate).format(HOUR_FORMAT).toString(),
        endTime = moment(toDate).format(HOUR_FORMAT).toString()
    return "Từ " +  startTime + " đến " + endTime
  }


  _renderTaskDetail(list) {
    let l = []
    list.forEach(task => {
      const taskTime = this._calculateWorkTime(task.startTime, task.endTime)
      let taskDetail = 
      <CheckBox  
        title={task.title + ", " + taskTime}
        checked={true} 
        checkedIcon="dot-circle-o" 
        onPress={() => {
          Navigation.push(MAP_SCREEN.id, {
            component: {
              id: TASK_INFO_SCREEN.id,
              name: TASK_INFO_SCREEN.settingName, 
              passProps: {
                taskId: task.id,
                navigateFrom: COMPANY_INFO_SCREEN.id
              }
            }
          })
        }}
        />
      l.push(taskDetail)
    });
    return l
  } 

  render() {
    return( 
      <View style={{flex: 1}}>
      <CollapsingToolbar 
        leftItem={ <Ionicons name="md-arrow-round-back" size={25} color={baseColor} /> }
        leftItemPress={() => Navigation.popTo(MAP_SCREEN.id)}
        toolbarColor='#fff'
        src={{
          uri: (this.state.company.picture === "") ? 
          NO_IMAGE:
          this.state.company.picture }}>
        
        <Text style={styles.companyName}>{this.state.company.name}</Text>
        <View style={styles.infoList}> 
          <MaterialIcons name="location-on" size={25} color="#d60000"/>
          <Text style={styles.title}>{this.state.company.address}</Text>
        </View>
        <View style={styles.infoList}>
          <Icon name="list-ol" size={25} color="#ffc107" />
          <Text style={styles.title}>Danh sách công việc tại điểm này</Text>
        </View>
        <View>
           {this._renderTaskDetail(this.state.tasks)}
        </View>
      </CollapsingToolbar>
      <View style={styles.buttonGuidanceComponent}>
          <TouchableOpacity
            style={ styles.buttonGuidance } 
            onPress={ this.handleGetDirections }>
            <FontAwesome5 name="directions" size={24} color="white"/>
            <Text style={{color: "white", fontSize: 20}}>CHỈ ĐƯỜNG ĐẾN CÔNG TY</Text>
          </TouchableOpacity> 
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    fontFamily:'Roboto-Bold',
    fontSize: 17,
    paddingLeft: 15
  },
  infoList: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.6,
    borderBottomColor: "#ccc"
  },
  companyImage: {
    width: DEVICE_WIDTH - 100, 
    height: 250,
    alignSelf: "center"
  },
  buttonGuidanceComponent: {
    position: "absolute",
    bottom:0,
    alignSelf:'center',
    width: DEVICE_WIDTH
  },
  buttonGuidance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 10,
    backgroundColor: baseColor,
  },
  companyName: {
    fontFamily: "Roboto-Black",
    fontSize: 28,
    paddingTop: 20,
    paddingBottom: 15, 
    paddingLeft: 15
  },
  companyAddress: {
   fontFamily:'Roboto-Regular',
   fontSize: 16,
   paddingBottom: 20
  },
})