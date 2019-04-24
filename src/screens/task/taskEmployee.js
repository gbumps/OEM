import React,{ Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  AsyncStorage,
  DeviceEventEmitter,
  RefreshControl,
  NetInfo,
  Vibration,
  ToastAndroid, 
  DatePickerAndroid
} from 'react-native';
import moment from "moment";
import { ButtonGroup } from "react-native-elements";
import Beacons from "react-native-beacons-manager";
import * as commons from "../../constants/common";
import { DEVICE_WIDTH, baseColor, DEVICE_HEIGHT } from "../../constants/mainSetting";
import { 
  CHECK_ATTEND_SUCESSFUL,  
  ERR_SERVER_ERROR, 
  CHECK_IN_SUCCESS 
} from "../../constants/alert";
import autobind from "class-autobind";
import { 
  requestUpcomingTask, 
  requestCheckAttendanceForTask, 
  requestTaskByDateURL
} from "../../api-service/taskAPI";
import axios from "axios";
import BackgroundTimer from "react-native-background-timer";
import TaskTodayView from "./taskToday";
import TaskUpcomingView from "./taskUpcoming";
import firebase from "react-native-firebase";
import { Navigation } from "react-native-navigation";
import { TASK_SCREEN } from "../../constants/screen";

const YELLOW_ORANGE = "#ffa500"
      

class TaskEmployee extends Component {
 
  //contructors
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: "",
      todayDate: "",
      leftButtonText: "",
      listTaskNotStart : [], 
      listTaskNotStartToday: [],
      listTaskInProgress: [],
      listTaskCompleted: [],
      listTaskAbsent: [],
      listWaitCheckAttendance: [],
      listCheckedAttendance:[],
      listTaskPendingApproval: [],
      todayTasks: [],
      upcomingTasks: [],
      selectedIndex: 0,
      upcomingTaskDate: "",
      upcomingTaskDateView: [],
      refreshing: false,
      networkState: "none",
      upcomingTaskData : []
    }
    autobind(this)
  }

  async componentDidMount() {
    this.navigationEventListener = Navigation.events().bindComponent(this);
    const token = await AsyncStorage.getItem(commons.TOKEN) 
    //console.log("token: ", token)
    this.setState({userToken: token})
    this._getTaskByDate()
    this._getUpcomingTask()
    this._activateBackgroundTimer() 
    firebase.notifications().onNotification(() => {
       this._getTaskByDate()
    })
    Navigation.events().registerCommandListener((name, params) => {
      //console.log("name: ", name)
      if (name === "popTo" && params.componentId === TASK_SCREEN.id) {
        this._getTaskByDate()
      }
    });
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === "CALENDAR_ICON") {
      this._openDatePicker()
    }
  }

  async componentWillMount() {
    axios.defaults.headers.common[commons.CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[commons.AUTHORIZATION] = await AsyncStorage.getItem(commons.TOKEN)
    NetInfo.isConnected.addEventListener('connectionChange', (connectionType) => {
       if (!connectionType) {
         this.setState({
           networkState: "flex"
         }) 
       } else {
         this.setState({
           networkState: "none"
         })
       }
    })
    const today = moment(new Date()).format(commons.DATE_FORMAT)
          upcomingDate = moment(today).add(1, 'days').format(commons.DATE_FORMAT)
    this.setState({
      selectedDate: today, 
      todayDate: today,
      upcomingTaskDate: upcomingDate
    })
  }

  _activateBackgroundTimer() {
    BackgroundTimer.runBackgroundTimer(() => { 
      //console.log('list task not start today: ', this.state.listTaskNotStartToday)
      if(typeof(this.state.listTaskNotStartToday !== undefined) &&
        this.state.listTaskNotStartToday.length !== 0) {
        this.state.listTaskNotStartToday.forEach((task) => {
          if (this._checkConditionForCheckAttendance(task)
              && !this.state.listWaitCheckAttendance.includes(task)){
              this.state.listWaitCheckAttendance.push(task)
          }
        }) 
      console.log('list wait',this.state.listWaitCheckAttendance)
      this._checkGateStatus()
      }
    }, 10000); //10 secs 
  }

  async _openDatePicker() {
    try {
      var currentDate = new Date()
      //alert("selected date: ", this.state.selectedDate)
      const {action, year, month, day} = await DatePickerAndroid.open( 
        (this.state.selectedIndex === 0) ? 
        {
          date: new Date(this.state.selectedDate),
          maxDate: new Date(this.state.todayDate)
        } : {
          date: new Date(this.state.upcomingTaskDate),
          minDate: currentDate.setDate(currentDate.getDate() + 1)
        }
      );
      if (action !== DatePickerAndroid.dismissedAction) {
        let selected = new Date(year + "/" + (month + 1) + "/" + day)
        switch(this.state.selectedIndex) {
          case 0: 
            if (!moment(selected).isSame(this.state.selectedDate)) {
              this.setState({
                selectedDate: moment(selected).format(commons.DATE_FORMAT)
              })
              this._getTaskByDate()
            }
            break;
          case 1:
            if (!moment(selected).isSame(this.state.upcomingTaskDate)) {
              this.setState({
                 upcomingTaskDate: moment(selected).format(commons.DATE_FORMAT) 
              })
              this._getUpcomingTask()
            }
            break;
        }
      }
    } catch ({code, message}) {
       alert("err at openning: ", message)
    }
  }

  _getTaskByDate() {
    if (this.props.userId !== undefined) { 
      var leftButton = moment(this.state.selectedDate).isSame(this.state.todayDate) ? commons.TODAY : moment(this.state.selectedDate).format("DD/MM/YYYY")
      axios.get(requestTaskByDateURL(this.props.userId, this.state.selectedDate), {}).then(res => {
        console.log('result day: ' + this.state.selectedDate, res.data)
        // if (!moment(this.state.selectedDate).isValid()) {
        //   alert(this.state.selectedDate + " is not valid !")
        // }
        this.setState({
          leftButtonText: leftButton,
          listWaitCheckAttendance: [],
          listCheckedAttendance: [],
          listTaskNotStartToday: (moment(this.state.selectedDate).isSame(this.state.todayDate)) ? this._loadListTaskByStatus(commons.TASK_NOT_START, res.data) : this.state.listTaskNotStartToday,
          listTaskNotStart: this._loadListTaskByStatus(commons.TASK_NOT_START, res.data),
          listTaskInProgress: this._loadListTaskByStatus(commons.TASK_IN_PROGRESS, res.data),
          listTaskCompleted: this._loadListTaskByStatus(commons.TASK_COMPLETED, res.data),
          listTaskPendingApproval: this._loadListTaskByStatus(commons.TASK_WAITING_FOR_APPROVE, res.data),
          listTaskAbsent: res.data.filter(t => t.attendanceStatus === commons.ABSENT)
        })
        
      }).catch(err => {
        //console.log("err at get today task: ", err)
        ToastAndroid.showWithGravity(ERR_SERVER_ERROR, ToastAndroid.SHORT,ToastAndroid.BOTTOM)
      })
    }
  }

  _setUpcomingTaskDateView() {
    if (this.state.upcomingTasks.length !== 0) {
      let upcomingTask = new Array(this.state.upcomingTasks.length).fill("white")
      upcomingTask.splice(0,1,baseColor)
      this.setState({
        upcomingTaskDateView: upcomingTask
      })
    } else { 
      this.setState({
        upcomingTaskDateView: []
      })
    }
  }

  _returnEachDataForTimeLine(task) {
  return {
    time: moment(task.startTime).format(HOUR_FORMAT) + "\n" + moment(task.endTime).format(HOUR_FORMAT), 
    title: task.title, 
    id: task.id,
    description: "Mô tả: " + task.description,
    workplaceName: task.workplaceName,
    companyDTO: task.companyDTO.name,
    circleColor: '#009688',
    imageUrl: task.companyDTO.picture 
  }
}

  _getUpcomingTask() {
    if(this.props.userId !== undefined) {
      axios.get(requestUpcomingTask(this.props.userId, this.state.upcomingTaskDate),{}
      ).then(res => {
        this.setState({
          upcomingTasks: res.data
        }) 
       }).catch(err => {
          switch(err.response.status) {
            case 500: 
            case 502: 
             ToastAndroid.showWithGravity(
               ERR_SERVER_ERROR,ToastAndroid.SHORT,ToastAndroid.BOTTOM)
             break;
          }
       })
    }
    this.state.upcomingTaskData = []
    if (this.state.upcomingTasks.length !== 0) {
       this.state.upcomingTasks[0].list.forEach((task) => {
        let data = this._returnEachDataForTimeLine(task) 
        this.state.upcomingTaskData.push(data)
      }) 
     this.setState({
       upcomingTaskData: this.state.upcomingTaskData
     })
     this._setUpcomingTaskDateView()
    } else {
      this.setState({
       upcomingTaskData: []
      })
    }
  }

  _loadListTaskByStatus = (statusId, listTotalTask) => {
    return listTotalTask.filter(t => 
      t.status === statusId && t.attendanceStatus !== commons.ABSENT
    )
  }

  _checkConditionForCheckAttendance = (task) => {
    const tComparedStart = this._compareTimeToCurrent(task.startTime)
    const tComparedEnd = this._compareTimeToCurrent(task.endTime)

      if (tComparedStart <= commons.TIME_ATTENDANCE_AVAILABLE) {
        //console.log('tcompared start ', tComparedStart + ' start time task ',task.startTime)
        //console.log('tcompared end ', tComparedEnd + ' start time task ',task.startTime)
        if (tComparedEnd <= commons.TIME_ATTENDANCE_AVAILABLE){
            //check absent for task 
          axios.put(requestCheckAttendanceForTask(task.id), {},{
          }).then(t => {
            this.state.listCheckedAttendance.push(task)
            this._removeTaskCheckedAttendance()
          }) 
          return false;
        } else {
          return true
        }
      }
      else {  
        return false
      }
  }
  
  _updateIndex(selectedIndex) {
    switch(selectedIndex) {
      case 0: 
        this._getTaskByDate()
        break;
      case 1:
        this._getUpcomingTask()
        this._setUpcomingTaskDateView()
        break;
    }
    this.setState({
      selectedIndex: selectedIndex,
    })  
  }

  _compareTimeToCurrent(time) { 
    var current = moment(new Date()),
        timeM = moment(time),
        differenceInMs = timeM.diff(current ,"minutes")
        //console.log('current time: ', current.toString())
        //console.log('moment time: ', timeM.toString())
        //console.log('different in ms: ', differenceInMs)
    return differenceInMs
  }

  async _removeTaskCheckedAttendance(){
   //console.log('remove: list checked before remove',this.state.listCheckedAttendance)
     this.state.listTaskNotStartToday.forEach((task,index,arrayNotStart) => {
        if (this.state.listCheckedAttendance.includes(task)) {
          arrayNotStart.splice(index,1)
        }
     });
    
     this.state.listCheckedAttendance = []

     if(this.state.listTaskNotStartToday.length === 0){
      await Beacons.stopRangingBeaconsInRegion(commons.IBEACONS) 
      //console.log('da dong gate do list not start empty')
    }
    //console.log('remove : list not start after removed',this.state.listTaskNotStart)
  }

  _checkGateStatus = async () => {
  if(this.state.listWaitCheckAttendance.length > 0) {
    Beacons.detectIBeacons()
    try {
       await Beacons.startRangingBeaconsInRegion(commons.IBEACONS)
       //console.log(`Beacons ranging started succesfully!`)
       DeviceEventEmitter.addListener(commons.BEACON_DID_RANGE, data => {
         //console.log('beacon found: ', data)
         // list
         const beaconLists = data.beacons
         //console.log("Beacon list: ", beaconLists)
         beaconLists.forEach(beacon => {
           this.state.listWaitCheckAttendance.forEach((task,index,arrayWait) => {
             //console.log('beacon_found :' , beacon.uuid + ' beacon_task',task.beaconModel)
             if (beacon.uuid === task.beaconModel.uuid &&
                 beacon.major === task.beaconModel.major &&
                 beacon.minor === task.beaconModel.minor){
                   //console.log('tim thay beacon trung')
               axios.put(requestCheckAttendanceForTask(task.id), {},{
               }).then(t => {
                 let localNoti = new firebase.notifications.Notification()
                       .setNotificationId(commons.CHECK_IN_BEACON_ID)
                       .setTitle(CHECK_IN_SUCCESS)
                       .setBody(CHECK_ATTEND_SUCESSFUL)
                       .android.setChannelId(commons.CHANNEL_NOTIFICATION_OEM)
                       .android.setSmallIcon(commons.IC_LAUNCHER)
                     let date = new Date();
                     date.setSeconds(date.getSeconds() + 2);
                     //console.log('date after set mins : ', date)
                     //console.log('local noti: ', localNoti)
                     firebase.notifications().scheduleNotification(localNoti, {
                       fireDate: date.getTime(),
                     })
                   this._getTaskByDate
                   Vibration.vibrate(700)
                   //Alert.alert(NOTIFICATION, CHECK_ATTEND_SUCESSFUL)
               })
               this.state.listCheckedAttendance.push(task)
               arrayWait.splice(index,1)
             }
           })
         })
         if(this.state.listCheckedAttendance.length > 0){
           this._removeTaskCheckedAttendance()
         }
       })
      //console.log('Enter beacon check !')
      //console.log(`Beacons ranging started succesfully!`)
      //DeviceEventEmitter.removeAllListeners
     // console.log('done start gate')
    } catch (err) {
      console.log(`Beacons ranging not started, error: ${error}`)
      console.log('da dong gate list wait empty')
    }
  } else { 
    //await DeviceEventEmitter.emit('beaconsDidRange')
    //DeviceEventEmitter.removeListener('beaconsDidRange')
    console.log('gate closed')
    await Beacons.stopRangingBeaconsInRegion(commons.IBEACONS)
  }}

  _renderTodayTask() {
    return(
       <TaskTodayView 
        listTaskInProgress={this.state.listTaskInProgress}
        listTaskPendingApproval={this.state.listTaskPendingApproval}
        listTaskNotStart={this.state.listTaskNotStart}
        listTaskCompleted={this.state.listTaskCompleted}
        listTaskAbsent={this.state.listTaskAbsent}/>
    )
  }

  _renderUpcomingTask() {
     return(
       <TaskUpcomingView 
        upcomingTasks={this.state.upcomingTasks} 
        upcomingTaskData={this.state.upcomingTaskData}
        upcomingTaskDateView={this.state.upcomingTaskDateView}
       />
     )
  }
  
  _onRefresh = () => {
    this.setState({refreshing: true});
    if (this.state.selectedIndex === 0) {
      this._getTaskByDate()
    } else {
      this._getUpcomingTask() 
    }
    this.setState({
      refreshing: false
    })
  }
  
  //render view 
  render() {
    const buttons = [this.state.leftButtonText, commons.UPCOMING] 
    return (
      <View style={{
        height: (this.state.selectedIndex === 0) ? DEVICE_HEIGHT - 100 : DEVICE_HEIGHT
      }}>
          <ButtonGroup 
            onPress={index => { this._updateIndex(index) }}
            selectedIndex={this.state.selectedIndex}
            buttons={buttons}
            textStyle={styles.textStyleButtonGroup}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.containerStyleButtonGroup}
            innerBorderStyle={{ color: "#ffffff" }}
            selectedButtonStyle={styles.selectedButtonStyleGroup}
            selectedTextStyle={styles.selectedTextStyle}
            fontFamily="Roboto-Bold"
          />
         <Text style={[styles.noIntenetConnection,{
            display: this.state.networkState
         }]}>Không có kết nối</Text>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          } 
          alwaysBounceVertical={true}
          contentContainerStyle={styles.scrollViewContainer}>
            {
             (this.state.selectedIndex === 0) ? 
              this._renderTodayTask() 
               : 
              this._renderUpcomingTask()
            }
        </ScrollView>
     </View> 
    )
  }
}

const styles = StyleSheet.create({
  noIntenetConnection: {
    width: DEVICE_WIDTH,
    backgroundColor: YELLOW_ORANGE,
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  },
  textStyleButtonGroup: {
    color: baseColor,
    fontFamily: 'Roboto-Bold',
    fontSize: 18
  },
  buttonStyle: {
    borderColor: baseColor,
    borderWidth: 1,
    borderRadius: 20,
    marginLeft: 3,
    marginRight: 3,
  },
  containerStyleButtonGroup: {
    backgroundColor: 'white',
    borderWidth: 0,
    height: 40
  },
  selectedButtonStyleGroup: {
    backgroundColor:  "#2a89fc",
    borderRadius: 20,
    borderColor: "#ffffff",
  },
  selectedTextStyle: {
    color: 'white',
    fontFamily: 'Roboto-Bold',
    fontSize: 18
  },
  scrollViewContainer: {
    flexGrow: 0.9, 
    width: DEVICE_WIDTH
  }, 
})

export default connect(
  null, 
  null
)(TaskEmployee)
