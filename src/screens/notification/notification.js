import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  ScrollView,
  AsyncStorage,
  RefreshControl, 
  ToastAndroid
} from 'react-native';
import { requestNotificationHistory } from "../../apis/notificationAPI";
import { Navigation } from "react-native-navigation";
import axios from "axios";
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from "react-native-vector-icons/Entypo";
import autobind from "class-autobind";
import Noti from "./notiInstance";
import moment from "moment";
import { NOTIFICATION_SCREEN } from "../../constants/screen";
import {
  CONTENT_TYPE, 
  AUTHORIZATION, 
  TOKEN, USER, 
  GREY, YELLOW_ORANGE, 
  MINUTES_DAY, DEFAULT_PAGE_NOTIFICATION, 
  MAXIMUM_NOTIFICATION_UPDATE,
  RED, 
} from "../../constants/common";
import { DEVICE_HEIGHT, baseColor } from "../../constants/mainSetting";
import { ERR_INTERNET_CONNECTION, ERR_SERVER_ERROR } from "../../constants/alert";
import firebase from "react-native-firebase";

class Notification extends Component {
 
  componentDidUpdate(prevStates) {
    if (this.state.unseenCount !== prevStates.unseenCount) {
      this._mergeOptionNavigation()
    }
  }

  //contructors
  constructor(props) {
    super(props)
    this.state = {
      notiHistory: [],
      unseenCount: 0,
      refreshing: false 
    }
    autobind(this)
  }
  //functions

  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[AUTHORIZATION] = await AsyncStorage.getItem(TOKEN)
  }

  async componentDidMount() {
    this.navigationEventListener = Navigation.events().bindComponent(this);
    this._getNotiHistory()
    this._mergeOptionNavigation()
    this._loadUnseenCountNotification()
    const userId = await AsyncStorage.getItem(USER.ID)
    Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex }) => {
      if (selectedTabIndex === 2 && this.state.notiHistory.length !== 0) {
         this._getNotificationFromServer(
           userId, 
           DEFAULT_PAGE_NOTIFICATION, 
           this.state.notiHistory.length
         )
      }
    });
  }
  
  _loadUnseenCountNotification() {
    firebase.notifications().onNotification((notification) => {
    this.setState({
      unseenCount: this.state.unseenCount + 1
    })})
  }

  _catchErr(err) {
    switch(err.response.status) {
    case 404: 
      ToastAndroid.showWithGravity(
        ERR_INTERNET_CONNECTION, 
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      )
      break
    case 500:
    case 502: 
      ToastAndroid.showWithGravity(
        ERR_SERVER_ERROR, 
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      )
      break
    }
  }
 
  _getNotificationFromServer(userId, page, count) {
    axios.get(requestNotificationHistory(userId,page,count)).then(res => {
      const data = res.data.notificationModels.content,
            count = res.data.notificationModels.content.filter(t => !t.seen).length
      //console.log("noti: ", data)
      //console.log("page: ", page)
      //merge new notifications after scroll down
      if (page !== DEFAULT_PAGE_NOTIFICATION && data.length !== 0) {
        data.map(t => this.state.notiHistory.push(t))
      }
      this.setState({
        standing: page,
        totalPages: res.data.notificationModels.totalPages,
        notiHistory: (page === DEFAULT_PAGE_NOTIFICATION) ? data : this.state.notiHistory,
        unseenCount: count 
      })
      //console.log('noti state: ', this.state)
    }).catch(err => {
        this._catchErr(err)
      }
    )
  }

  async _getNotiHistory() {
    const userId = await AsyncStorage.getItem(USER.ID)
    const numberOfNotiPages = this.state.totalPages
    if (numberOfNotiPages === undefined) {
      this._getNotificationFromServer(
        userId, 
        DEFAULT_PAGE_NOTIFICATION, 
        MAXIMUM_NOTIFICATION_UPDATE
      )
    } else {
      let standing = this.state.standing + 1
      //console.log('standing: ', standing)
      //console.log('numberOfNotipage: ', numberOfNotiPages)
      if (standing < numberOfNotiPages) {
        this._getNotificationFromServer(userId, standing, MAXIMUM_NOTIFICATION_UPDATE)
      }
    }
    
  }
  
  _getTimeReceivedNotification(today, dateReceived) {
    let time = today.diff(moment(dateReceived), "days")
    if (time == 0) {
      time = today.diff(moment(dateReceived), "hours") 
      if (time > 0) return time + " h"
      else {
        time = today.diff(moment(dateReceived), "minutes")
        if (time > 0) return time + " phút"
        else return "vài giây"
    } 
   }
    return time + " ngày"
  }

  _renderNoti(list) {
    let newNotis = [], oldNotis = []
    var today = moment(new Date())
    if (list === undefined || Object.keys(list).length == 0) {
      return (
        <View style={styles.noNewNoti}>
          <Icon name="tasks" size={60} color="#ccc"/>
          <Text style={{ fontSize: 20 }}>
            Không có thông báo mới
          </Text>
        </View>
      )
    }
    else { 
      Object.keys(list).map((key,index) => {
        let date = this._getTimeReceivedNotification(today, list[key].dateCreate) 
        let noti = 
           <Noti
              notiId={list[key].id}
              taskId={list[key].taskId}
              key={index}
              time={date}
              title={ 
               (list[key].title.length >= 30) ? 
                list[key].title.substring(0,30) + "..." :
                list[key].title
              }
              description={list[key].message} 
              seen={list[key].seen} 
            />
        if (!list[key].seen || 
          today.diff(moment(list[key].dateCreate) ,"minutes") < MINUTES_DAY) {
          newNotis.push(noti)
        }
        else {
          oldNotis.push(noti)
        }
      })
    return (
      <View style={{flexDirection: "column"}}> 
        <View style={styles.titleNotiTypeContainer}>
          <Entypo name={"new"} size={28} color={YELLOW_ORANGE}/>
          <Text style={styles.title}>Mới nhất</Text>
        </View>
        {newNotis}
        <View style={styles.titleNotiTypeContainer}>
          <Entypo name={"back-in-time"} size={28} color={GREY}/>
          <Text style={styles.title}>Cũ hơn</Text>
        </View>
        {oldNotis}
      </View>
    )
  }}
 
  _mergeOptionNavigation() {
    if (this.state.unseenCount === 0) {
      Navigation.mergeOptions(NOTIFICATION_SCREEN.id, {
          bottomTab: {
            badge: "",
          }
        })
      } 
    else { 
      Navigation.mergeOptions(NOTIFICATION_SCREEN.id, {
        bottomTab: {
          badge: String(this.state.unseenCount),
          badgeColor: RED,
        }
      })
    }
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this._getNotiHistory()
    this.setState({
      refreshing: false
    })
    this._mergeOptionNavigation()
  }
  //render view 
  render() {
    return (
      <ScrollView 
        refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh}
        /> } 
        onMomentumScrollEnd={({nativeEvent}) => {
          var windowHeight = DEVICE_HEIGHT,
          height = nativeEvent.contentSize.height,
          offset = nativeEvent.contentOffset.y;
          if( windowHeight + offset >= height ){
            this._getNotiHistory()
          }
          // if (this.isCloseToBottom(nativeEvent)) {
          //    this._getNotiHistory()
          // }
        }}
      >
        { this._renderNoti(this.state.notiHistory) }
      </ScrollView>
    )
  }
}

const styles = {
  title: {
    fontFamily:'Roboto-Black',
    fontSize: 18,
    paddingLeft: 12
  },
  titleNotification: {
    fontSize: 18, 
    fontFamily: "Roboto-Bold"
  }, 
  descripNotification: {
    flexDirection: "row", 
    justifyContent: "space-between"
  },
  noNewNoti: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: DEVICE_HEIGHT / 2
  },
  notiInstance: {
    flexDirection: 'column',
    padding:15,
    margin: 10,
    justifyContent: "space-between"
  },  
  titleNotiTypeContainer: {
    flexDirection: "row",
    borderBottomColor: "#ccc",
    borderBottomWidth: 0.7,
    padding: 14,
  }
}

export default connect(
  null, 
  null
)(Notification)