import React,{ Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import moment from "moment";
import { Badge } from "react-native-elements";
import autobind from "class-autobind";
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from "react-native-vector-icons/AntDesign";
import PropTypes from 'prop-types';
import { baseColor } from "../../constants/mainSetting";
import TaskItem from "./taskItem";
import { YELLOW_ORANGE, GREEN,GREY, RED, HOUR_FORMAT } from "../../constants/common";

class TaskTodayView extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      inProgress: 'flex',
      notStart: 'flex',
      done: 'flex',
      absent: 'flex',
      pending: 'flex', 
    }
    autobind(this)
  }

  _calculateWorkTime(fromDate, toDate) {
    const from = moment(fromDate).format(HOUR_FORMAT),
          to = moment(toDate).format(HOUR_FORMAT)
    return (from + " - " + to)
  }

  _returnTaskByStatus(list) { 
    let l = []
    //console.log('list task in _returnTaskByStatus: ', list)
    Object.keys(list).map(key => {
      workTime = this._calculateWorkTime(list[key].startTime, list[key].endTime)
      let addressCompany = list[key].companyDTO.address,
          nameCompany = list[key].companyDTO.name
      let t = 
        <TaskItem
          key={list[key].id}
          id={list[key].id}
          title={
            (list[key].title.length >= 16) ? 
                list[key].title.substring(0,15) + "..." :
                list[key].title
          }
          imageCompany={list[key].companyDTO.picture}
          companyAddress={
            (addressCompany.length >= 15) ? 
            addressCompany.substring(0,15) + "..." : addressCompany
          }
          workTime={workTime}
          companyName={
            (nameCompany.length >= 20) ? 
            nameCompany.substring(0,20) + "..." : nameCompany
          }
          attendance={list[key].attendanceStatus}
          status={list[key].status}
        />
      l.push(t)
    })
    return l
  }
  
  _returnBadgeStyle(color) {
    return {
      padding: 15, 
      backgroundColor: color
    } 
  }

  render() {
    return(
      <View>
          <TouchableOpacity onPress={() => this.setState({
            inProgress: this.state.inProgress === 'none' ? 'flex' : 'none'
          })}>
            <View style={styles.titleTodayTask}>
              <View style={{flexDirection: "row"}}>
              <Icon name="suitcase" size={25} color={YELLOW_ORANGE} />
               <Text style={styles.title}> Đang thực hiện </Text>
              </View>
              <View>
               <Badge status="primary" value={this.props.listTaskInProgress.length} 
                    textStyle={{color: "white"}}
                     badgeStyle={this._returnBadgeStyle(YELLOW_ORANGE)} />
              </View>
            </View>
          </TouchableOpacity>
           <View style={{alignItems: 'center' , display: this.state.inProgress}}> 
              {this._returnTaskByStatus(this.props.listTaskInProgress)}
            </View>
          <TouchableOpacity onPress={() => this.setState({
            pending: this.state.pending === 'none' ? 'flex' : 'none'
          })}>
            <View style={styles.titleTodayTask}> 
              <View style={{flexDirection: "row"}}>
               <Icon name="clock-o" size={25} color={baseColor}/>
               <Text style={styles.title}> Đang chờ duyệt </Text>
              </View>
              <View> 
                <Badge status="primary" value={this.props.listTaskPendingApproval.length} 
                       textStyle={{color: "white"}}
                       badgeStyle={this._returnBadgeStyle(baseColor)}
                />
              </View>
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'center',display: this.state.pending}}> 
            {this._returnTaskByStatus(this.props.listTaskPendingApproval)}
          </View>
          <TouchableOpacity onPress={() => this.setState({
            notStart: this.state.notStart === 'none' ? 'flex' : 'none'
          })}>
            <View style={styles.titleTodayTask}>
              <View style={{flexDirection: "row"}}>
              <Icon name="power-off" size={25} color={GREY} />
                <Text style={styles.title}> Chưa bắt đầu </Text>
              </View>
              <View>
              <Badge status="primary" value={this.props.listTaskNotStart.length} 
                     textStyle={{color: "white"}}
                     badgeStyle={this._returnBadgeStyle("#aaaaaa")} />
              </View>
            </View>
            </TouchableOpacity>
            <View style={{alignItems: 'center', display: this.state.notStart}}> 
              {this._returnTaskByStatus(this.props.listTaskNotStart)}
            </View>
          <TouchableOpacity onPress={() => this.setState({
            done: this.state.done === 'none' ? 'flex' : 'none'
          })}>
            <View style={styles.titleTodayTask}> 
              <View style={{flexDirection: "row"}}>
                <Image source={require("../../assets/icon/completed.png")}/>
                <Text style={styles.title}> Đã hoàn thành </Text>
              </View>
              <View> 
                <Badge status="primary" value={this.props.listTaskCompleted.length} 
                       textStyle={{color: "white"}}
                       badgeStyle={this._returnBadgeStyle(GREEN)}
                />
              </View>
            </View>
            <View style={{alignItems: 'center', display: this.state.done}}> 
              {this._returnTaskByStatus(this.props.listTaskCompleted)}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({
            absent: this.state.absent === 'none' ? 'flex' : 'none'
          })}>
            <View style={styles.titleTodayTask}> 
              <View style={{flexDirection: "row"}}>
                <AntDesign name="closecircle" size={25} color={RED}/>
                <Text style={styles.title}> Quá hạn </Text>
              </View>
              <View> 
                <Badge status="primary" value={this.props.listTaskAbsent.length} 
                       textStyle={{color: "white"}}
                       badgeStyle={this._returnBadgeStyle(RED)}
                />
              </View>
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'center',display: this.state.absent}}> 
            {this._returnTaskByStatus(this.props.listTaskAbsent)}
          </View>
      </View>
    )
  }
} 

const styles = StyleSheet.create({
  title: {
    fontFamily:'Roboto-Bold',
    fontSize: 18,
    paddingLeft: 15,
  },
  titleTodayTask: { 
    flexDirection: 'row',
     padding: 15,
     justifyContent: "space-between" 
  }
})

TaskTodayView.propTypes = {
  listTaskInProgress: PropTypes.array,
  listTaskPendingApproval: PropTypes.array,
  listTaskNotStart: PropTypes.array,
  listTaskCompleted: PropTypes.array,
  listTaskAbsent: PropTypes.array
}

export default TaskTodayView