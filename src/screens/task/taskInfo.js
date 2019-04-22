import React,{ Component } from "react";
import { connect  } from "react-redux";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AsyncStorage,
  ScrollView,
  ProgressBarAndroid
} from 'react-native';
import { CheckBox } from "react-native-elements";
import { 
  TASK_INFO_SCREEN, 
  TASK_REPORT_SCREEN, 
  TASK_REPORT_PROBLEM_SCREEN,
  TASK_SCREEN,
  COMPANY_INFO_SCREEN,
  NOTIFICATION_SCREEN,
} from "../../constants/screen";
import renderStatusBar from "../../elements/statusBar";
import renderTopTab from "../../elements/topTab";
import renderBottomTabIcon from "../../elements/bottomTabIcon";
import CollapsingToolbar from 'react-native-collapsingtoolbar';
import { DEVICE_WIDTH, baseColor, DEVICE_HEIGHT } from "../../constants/mainSetting";
import { Navigation } from "react-native-navigation";
import Icon from "react-native-vector-icons/FontAwesome"
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import getDirections from 'react-native-google-maps-directions'
import { fetchBaseColor } from "../../functions/functions";
import moment from "moment";
import * as commons from "../../constants/common";
import axios from "axios";
import { requestTaskDetailURL } from "../../apis/taskAPI";
import { 
  ERR_TASK_NOT_START, 
  NOTIFICATION, 
  ERR_TASK_OVERDUE, 
  ERR_TASK_COMPLETED,
  ERR_REPORT_PROBLEM_ALREADY_SUBMITTED
} from "../../constants/alert";
import autobind from "class-autobind";
import ImageInstance from "../../elements/imageInstance";
import { getReport } from "../../apis/reportAPI";
import AntDesign from "react-native-vector-icons/AntDesign";

const CheckBoxInstance = (props) => (
  <View style={styles.checkBoxContainerStyle}>
  <CheckBox
      title={props.title}
      checkedIcon='check-square'
      uncheckedIcon='square'
      checkedColor="green"
      containerStyle={styles.checkBox}
      checked={props.checkState}
      onPress={props.onPress}
  /> 
  <Image source={{uri: props.imageSource}} style={styles.checkBoxImage} />
  </View>
)

class TaskInfo extends Component {
  //options for navigation
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
      bottomTab: renderBottomTabIcon(TASK_INFO_SCREEN)
    }    
  }

  //contructors
  constructor(props) {
    super(props)
    this.state = {
      task: {},
      checkList: [],
      status: 0,
      showImageWorkplace: "none", 
      showDescription: "none", 
      descriptionReports: "",
      imageReports: [],
      userLocation: {},
      descriptionProblem: "",
      imageProblem: [], 
      reportCompleteEvaluation: "",
      reportProblemEvaluation: "",
      submitCompleteBtn: "none",
      loading: true 
    }
    autobind(this)
    this.navigationEventListener = Navigation.events().bindComponent(this);
  }
  //functions
  async componentWillMount() {
    axios.defaults.headers.common[commons.CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[commons.AUTHORIZATION] =await AsyncStorage.getItem(commons.TOKEN)
    this.setState({
      loading: true
    })
    navigator.geolocation.getCurrentPosition(
      pos => {
        let lat = parseFloat(pos.coords.latitude),
            lon = parseFloat(pos.coords.longitude)
        this._setUserLocation(lat, lon)
      },
      err => {
        console.log(err);
      },
      // {
      //   timeout: 20000,
      //   maximumAge: 10000,
      //   enableHighAccuracy: true
      // }
    );
  }

  _setUserLocation(lat, lon) {
    this.setState({
      userLocation: {
        latitude: lat,
        longitude: lon 
      }
    });
  }
  
  async componentDidMount() {
    const link = requestTaskDetailURL(this.props.taskId)
    axios.get(link, { }).then(res => {
      res.data.checkList.map(t => this.state.checkList.push(t.status === 0 ? false: true))
      switch(res.data.status) {
        case commons.TASK_COMPLETED:
        case commons.TASK_NOT_START:
        case commons.TASK_WAITING_FOR_APPROVE: 
          this.setState({
            submitCompleteBtn: "none"
          })
          break;
        case commons.TASK_IN_PROGRESS:
          this.setState({ 
            submitCompleteBtn: "flex"
          })
          break;
      }
      this.setState({
        loading: false,
        task: res.data, 
        checkList: this.state.checkList
      })
    }).catch(err => {
       switch (err.response.status) {
          case 500: 
          case 502:
            this.setState({
              loading: false,
              status: 500
            })
          break
       }
    })
    const linkReport = getReport(this.props.taskId)
    let t = await axios.get(linkReport, {})
    if (t.data === undefined || t.data.length === 0) {

    } else {
      t.data.reportList.forEach(report => { 
        var imageData = report.photo.split("; ")
        switch (report.type) {
          case 1: 
            this.setState({ 
              reportCompleteEvaluation: report.evaluation,
              descriptionReports: report.description,
              imageReports: imageData
            })
            break;
          case 2: 
            this.setState({ 
              reportProblemEvaluation: report.evaluation,
              descriptionProblem: report.description,
              imageProblem: imageData
            })
            break;
        }
      })
    }
     
  }
  
  _showWorkplacePicture() {
    this.setState({ 
      showImageWorkplace: "flex"
    })
  }

  //calculate from date to date
  _calculateWorkTime(fromDate, toDate) {
    let startTime = moment(fromDate).format(commons.HOUR_FORMAT).toString(),
        endTime = moment(toDate).format(commons.HOUR_FORMAT).toString()
    return "Từ " +  startTime + " đến " + endTime
  }
  
  _loadCheckList(checkList) {
    let l = []
    checkList.map((item,index) => {
      l.push(
        <CheckBoxInstance 
          key={index}
          title={item.title}
          checkState={this.state.checkList[index]} 
          onPress={() => { 
            switch(this.state.task.status) {
              case commons.TASK_COMPLETED:
              case commons.TASK_NOT_START:
              case commons.TASK_WAITING_FOR_APPROVE: 
                return;
            } 
            if (this.state.task.attendanceStatus === commons.ABSENT) {
              return;
            }
            this.state.checkList[index] = !this.state.checkList[index]
            this.state.task.checkList[index].status = (this.state.task.checkList[index].status === 0) ? 
            1 : 0
            this.setState({
              checkList: this.state.checkList,
              task: this.state.task
            })
            }
          }
          imageSource={item.picture}
        /> 
       )
    })
    return l
  }

  _handleLoadImage(list) {
    if (list.length == 0) {
      return (<Text style={{color: commons.RED, ...styles.title}}>Không có hình ảnh</Text>) 
    }
    return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={{ padding: 10 }}> 
      { list.map((l,index) =>{
        return ( 
          <ImageInstance 
            key={index}
            index={index}
            imageList={list}
            imageSource={{uri: l}} 
            displayClose={"none"}
            />
        )})
      }
    </ScrollView>
    );
  }

  _loadReports() {
     if (this.state.imageReports.length !== 0) {
        return "flex"
     }
     return "none"
  }

  _loadProblem() { 
    if (this.state.imageProblem.length !== 0) {
      return "flex"
   }
   return "none"
  }
 
  handleGetDirections = () => {
    const data = {
      source: this.state.userLocation,
      destination: {
        latitude: this.state.task.workplace.latitude,
        longitude: this.state.task.workplace.longitude
      },
      params: [
        {
          key: "travelmode",
          value: "driving"        // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate"       // this instantly initializes navigation using the given travel mode 
        }
      ]
    }
    getDirections(data)
  }

  _renderTaskRating() {
    let l = [];
    if (this.state.task.rating === null) {
      return l
    }
    for (var i = 0; i < this.state.task.rating;i++) {
      l.push(<FontAwesome name="star" size={25} color={commons.YELLOW_ORANGE} style={{padding: 10}}/>)
    }
    for (var i = 0;i < 5 - this.state.task.rating; i++) {
      l.push(<FontAwesome name="star-o" size={25} color={commons.YELLOW_ORANGE} style={{padding: 10}}/>)
    }
    return l
  }

  _renderOptionTopBarForReport(type, component) {
    return {
      visible: true,
      noBorder: true,
      title: {
        color: (type === 1) ? baseColor : commons.RED,
        text: component.vnName,
        fontFamily: 'Roboto-Bold',
        fontSize: 28
      },
      backButton: {
        showTitle: false,
        color: baseColor
      }, 
      elevation: 0,
      background: {
        color: 'white',
      }
    }
  }

  //render the full view of task detail
  _renderTaskDetailView(taskDetail) {
    if (Object.keys(taskDetail).length === 0){
      return []
    }
    else {
      var weekday = new Array(7);
          weekday[0] = commons.SUNDAY;
          weekday[1] = commons.MONDAY;
          weekday[2] = commons.TUESDAY;
          weekday[3] = commons.WEDNESDAY;
          weekday[4] = commons.THURSDAY;
          weekday[5] = commons.FRIDAY;
          weekday[6] = commons.SATURDAY;

      const workTime = this._calculateWorkTime(taskDetail.startTime,taskDetail.endTime),
            workDate = new Date(taskDetail.startTime.replace("+0000", "Z"))
       
      return (
      <View style={{flex: 1}}>
        <Text style={[styles.taskName, {
          color:  (taskDetail.attendanceStatus === commons.ABSENT) ? 
          "#f43030" : fetchBaseColor(this.state.task.status)}]}>
          {taskDetail.id + " - " + taskDetail.title}
        </Text>
        <TouchableOpacity onPress={() => this.setState({
          showImageWorkplace: this.state.showImageWorkplace === 'none' ? 'flex' : 'none'
        })}>
          <View style={styles.titleContainer}>
            <Icon name="building-o" size={25} color="#007bff" />
            <Text style={styles.title}>
              {taskDetail.workplace.name}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ display: this.state.showImageWorkplace }}> 
          <Image 
            source={{
               uri: (taskDetail.workplace.picture === "") ? 
               commons.NO_IMAGE:
               taskDetail.workplace.picture }}
            style={{width: DEVICE_WIDTH, height: 200}}/>
        </View>
        <TouchableOpacity onPress={ this.handleGetDirections }>
        <View style={styles.titleContainer}>
          <FontAwesome5 name="location-arrow" size={25} color="#dc3545" />
          <Text style={styles.title}> Chỉ đường tới công ty </Text>
        </View>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Icon name="calendar" size={25} color="#a900c6" />
          <Text style={styles.title}>
            {weekday[workDate.getDay()] + ", ngày " + 
            workDate.getDate() + " tháng " + 
            (workDate.getMonth() + 1) + " năm " + 
            workDate.getFullYear() }
          </Text>
        </View>
          <View style={styles.titleContainer}>
            <Icon name="clock-o" size={25} color="#dc3545" />
            <Text style={styles.title}>
              {workTime}
            </Text>
          </View>
        <TouchableOpacity onPress={() => this.setState({
          showDescription: this.state.showDescription === 'none' ? 'flex' : 'none'
        })}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="description" size={25} color="#007bff" />
            <Text style={styles.title}> Mô tả </Text>
          </View>
        </TouchableOpacity>
        <View style={[ styles.descriptionContainer, 
           {display: this.state.showDescription }
         ]}> 
          <Text style={styles.taskDetailDescriptionStyle}>
          {(taskDetail.description.length === 0) ? commons.NO_DETAIL : taskDetail.description }
          </Text>
        </View>
        <View style={[styles.titleContainer]}>
          <Icon name="list-ol" size={25} color={commons.YELLOW_ORANGE} />
          <Text style={styles.title}> Danh sách công việc </Text>
        </View>
        <View style={{ marginLeft: 15 }}>
          { this._loadCheckList(taskDetail.checkList)}
        </View>
        <View style={{display: this._loadReports()}}>
          <View style={[styles.titleContainer]}>
            <Icon name="list-ol" size={25} color={commons.YELLOW_ORANGE} />
            <Text style={styles.title}> Báo cáo công việc </Text>
          </View>
          <View> 
            <View style={{flexDirection: "row", padding: 15}}> 
              <Text style={styles.title}> Mô tả: </Text> 
              <Text style={{ fontSize: 18}}>
                {this.state.descriptionReports}
              </Text>
            </View>
            {this._handleLoadImage(this.state.imageReports)}
          </View>
            <View style={{padding: 15}}> 
            <Text style={styles.title}>Đánh gía của quản lý: </Text> 
               <View style={{flexDirection: "row", }}> 
                  {this._renderTaskRating()}
               </View>
            </View>
            <View style={{padding: 15}}> 
            <Text style={styles.title}>Nhận xét của quản lý: </Text> 
              <Text style={{ fontSize: 18, paddingLeft: 15 }}>
                {this.state.reportCompleteEvaluation}
              </Text>
            </View>
        </View>
        <View style={{display: this._loadProblem()}}>
          <View style={[styles.titleContainer]}>
            <MaterialIcons name="report-problem" size={25} color={commons.YELLOW_ORANGE} />
            <Text style={styles.title}> Báo cáo vấn đề </Text> 
          </View>
          <View>
            <View style={{flexDirection: "row", padding: 15}}> 
              <Text style={styles.title}> Mô tả: </Text> 
              <Text style={{ fontSize: 18 }}>
                {this.state.descriptionProblem}
              </Text>
            </View>
            {this._handleLoadImage(this.state.imageProblem)}
            <View style={{padding: 15}}> 
              <Text style={styles.title}>Nhận xét của quản lý: </Text> 
              <Text style={{ fontSize: 18, paddingLeft:15 }}>
                {this.state.reportProblemEvaluation}
              </Text>
            </View>
          </View> 
        </View>
      </View>
    )}
  }
   
  _handleNavigation(type) {
    const taskId = this.state.task.id,
          taskStatus =this.state.task.status,
          taskCheckList = this.state.task.checkList,
          taskAttendance = this.state.task.attendanceStatus
    if(taskStatus === commons.TASK_NOT_START && taskAttendance !== commons.ABSENT) {
      Alert.alert(NOTIFICATION, ERR_TASK_NOT_START)
      return;
    } else if (taskAttendance === commons.ABSENT) {
     Alert.alert(NOTIFICATION, ERR_TASK_OVERDUE)
     return;
    } else if (taskStatus === commons.TASK_COMPLETED || this.state.imageReports.length !== 0) {
      Alert.alert(NOTIFICATION, ERR_TASK_COMPLETED) 
      return;
    } else if (type === 2 && this.state.imageProblem.length !== 0) {
      Alert.alert(NOTIFICATION, ERR_REPORT_PROBLEM_ALREADY_SUBMITTED )
      return;
    } else if (type === 2 && taskStatus === commons.TASK_WAITING_FOR_APPROVE) {
      Alert.alert(NOTIFICATION, ERR_TASK_COMPLETED) 
      return;
    }
    Navigation.push(TASK_INFO_SCREEN.id,{ 
      component: {
        name: TASK_REPORT_SCREEN.settingName,
        passProps: {
          reportType: type,
          taskId: taskId,
          taskStatus: taskStatus,
          taskCheckList: (type === 1) ? taskCheckList : [],
          navigateFrom: this.props.navigateFrom
        },
        options: {
          topBar: this._renderOptionTopBarForReport(type, (type === 1) ? TASK_REPORT_SCREEN : TASK_REPORT_PROBLEM_SCREEN), 
          bottomTabs: {
            visible: false
          }
        }
      }
    })
  }

  _handlePop() {
     switch(this.props.navigateFrom) {
      case TASK_SCREEN.id:
        Navigation.popTo(TASK_SCREEN.id)
        break;
      case COMPANY_INFO_SCREEN.id:
        Navigation.popTo(COMPANY_INFO_SCREEN.id)
        break;
      case NOTIFICATION_SCREEN.id: 
        Navigation.popTo(NOTIFICATION_SCREEN.id)
        break
      case commons.TASK_NOTIFICATION: 
        Navigation.dismissAllModals()
        break
     }
  }

  //render view 
  render() {
    return (
      this.state.loading === true ?
    <View style={{
        flex: 1,
        backgroundColor: "transparent", 
        justifyContent: "center", 
        alignSelf: "center",
        width:DEVICE_WIDTH,
        height: DEVICE_HEIGHT
    }}>
      <ProgressBarAndroid animating={true}/>
    </View> : 
      <View style={{flex: 1}}>
        {
          (this.state.status === 500) ?
           <View style={styles.errLoadInfoTask}>
              <AntDesign name="questioncircle" size={60} color="#ccc"/>
              <Text style={{ fontSize: 20 }}>
                 Đã xảy ra lỗi
              </Text>
           </View>
            : 
            <View style={{height: DEVICE_HEIGHT - 55}}>
            <View style={{height: DEVICE_HEIGHT - 100}}>
              <CollapsingToolbar 
                leftItem={<Ionicons name="md-arrow-round-back" size={25} color={baseColor} />}
                leftItemPress={() => {
                  this._handlePop()
                }}
                rightItem={<Icon name="warning" size={25} color={commons.RED} />}   
                rightItemPress={() => this._handleNavigation(commons.REPORT_PROBLEM)}
                toolbarColor='#fff'  
                src={{
                  uri: (this.state.task.zonePicture === "") ? 
                  commons.NO_IMAGE :
                  this.state.task.zonePicture }}>
                  {this._renderTaskDetailView(this.state.task)}
              </CollapsingToolbar>
            </View>
            <View style={styles.buttonCompleteComponent}>
              <TouchableOpacity
                style= {[
                  styles.buttonComplete, 
                  {display: this.state.submitCompleteBtn}
                ]}
                onPress={() => this._handleNavigation(commons.REPORT_TASK)}> 
                <Text style={{color: "white", fontSize: 20}}>HOÀN THÀNH</Text>
              </TouchableOpacity> 
            </View>
            </View>
        }
    </View>
    )
  }
}

const styles = StyleSheet.create({
  descriptionContainer: {
    borderBottomColor: "#ccc", 
    borderBottomWidth: 0.7,
    paddingLeft: 35
  },
  checkBoxImage: {
    width: 40, 
    height: 40, 
    marginTop: 10, 
    marginBottom:10
  },
  container: {
    justifyContent: 'space-between',
    flexDirection: 'column'
  },
  taskName: {
     fontFamily: "Roboto-Black",
     fontSize: 35,
     padding: 20
  },
  title: {
   fontFamily:'Roboto-Bold',
   fontSize: 17,
   paddingLeft: 15
  },
  titleContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomColor: '#CCCCCC', 
    borderBottomWidth: 0.7,
    elevation: 0
  },
   buttonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16
   },
  buttonCompleteComponent: {
    position:'absolute',
    bottom: 0,
    alignSelf:'center',
    width: DEVICE_WIDTH
  },
  buttonComplete: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#00af63",
  },
  checkBoxContainerStyle: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 0.8,
    borderBottomColor: "#ccc",
    width: 370
  },
  checkBox: {
    borderWidth: 0,
    backgroundColor: "transparent",
    width: DEVICE_WIDTH - 100
  },
  errLoadInfoTask: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT 
  },
  taskDetailDescriptionStyle: {
    padding: 25,
    fontSize: 18,
    fontFamily: "Roboto-Regular"
  }
})

export default connect(
  null, 
  null
)(TaskInfo)