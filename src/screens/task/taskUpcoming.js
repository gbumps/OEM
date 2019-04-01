import React,{ Component } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { 
  HOUR_FORMAT, GREEN, 
} from "../../constants/common";
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from "moment";
import Timeline from "react-native-timeline-listview";
import { DEVICE_WIDTH, baseColor, DEVICE_HEIGHT } from "../../constants/mainSetting";
import { TASK_SCREEN, TASK_INFO_SCREEN } from "../../constants/screen";
import { Navigation } from "react-native-navigation";
import PropTypes from 'prop-types';



export default class TaskUpcomingView extends Component {
  constructor(props) {
    super(props) 
    this.state={
      upcomingTasks: this.props.upcomingTasks,
      upcomingTaskDateView: this.props.upcomingTaskDateView,
      upcomingTaskData : this.props.upcomingTaskData
    }
  }

  
  _renderTimelineUpcomingTask() { 
    if(this.state.upcomingTaskData.length !== 0) {
     return (
       <Timeline
         style={styles.timeLine}
         innerCircle={'icon'} 
         circleSize={28}
         circleColor={GREEN}
         lineColor='#bcbcbc'
         timeContainerStyle={{minWidth:52, marginTop: 1}}
         timeStyle={styles.timeLineTimeStyle}
         separator={true} 
         onEventPress={(t) => {
           Navigation.push(
             TASK_SCREEN.id, {
             component: {
               id: TASK_INFO_SCREEN.id,
               name: TASK_INFO_SCREEN.settingName,
               passProps: {
                 taskId: t.id,
                 navigateFrom: TASK_SCREEN.id
               }
             }
           })
         }}
         descriptionStyle={{color: 'gray'}}
         options={{ style:{paddingTop:5} }}
         data={this.state.upcomingTaskData}
       />
     )
    }
    else return(
       <View style={styles.noWorkForThisDayContainer}>
        <Icon name="tasks" size={60} color="#ccc"/>
        <Text style={{ fontSize: 20 }}>
          Không có công việc cho ngày này
        </Text>
       </View>
   )
 }

 _returnEachDataForTimeLine(task) {
  return {
    time: moment(task.startTime).format(HOUR_FORMAT) + "\n" + moment(task.endTime).format(HOUR_FORMAT), 
    title: task.title, 
    id: task.id,
    description: "Mô tả: " + task.description + "\n" + "Tại công ty: " + task.companyDTO.name,
    circleColor: '#009688',
    lineColor:'#009688',
  }
}

 _renderUpcomingTask(upcomingTasks) {
   if (upcomingTasks === undefined || 
     Object.keys(upcomingTasks) == null || 
     Object.keys(upcomingTasks).length === 0
   ) {  
     return (
       <View>

       </View>
     )
   }
   else {
   return ( 
     <View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
         {
           upcomingTasks.map((t,index) => { 
             let date = t.date.split(" - ")[1].split("/")[0]
             let month = t.date.split(" - ")[1].split("/")[1] 
             return (
               <TouchableOpacity style={[styles.shadowStyle, styles.dayBubble, 
                 {backgroundColor: this.state.upcomingTaskDateView[index] }]}
                 onPress={() => {
                   this.state.upcomingTaskData = []
                   this.state.upcomingTaskDateView.forEach((item,i) => 
                     this.state.upcomingTaskDateView[i] = "white"
                   ) 
                   this.state.upcomingTaskDateView[index] = baseColor
                   t.list.forEach((task) => {
                     let data = this._returnEachDataForTimeLine(task)
                     this.state.upcomingTaskData.push(data)
                   })
                   this.setState({
                     upcomingTaskData: this.state.upcomingTaskData,
                     upcomingTaskDateView: this.state.upcomingTaskDateView
                   })
                 }}>
                 <Text style={[styles.dateScrollView, {
                   color: (this.state.upcomingTaskDateView[index] === baseColor) 
                   ? "white": "black" 
                 }]}>{date}</Text>
                 <View style={{
                   borderWidth: 1, 
                   width: 30, 
                   borderColor: (this.state.upcomingTaskDateView[index] === baseColor) 
                   ? "white": "black"
                  }}></View> 
                 <Text style={{
                   alignItems: "center",
                   justifyContent: "center",
                   color: (this.state.upcomingTaskDateView[index] === baseColor) ? "white": "black"
                 }}>{month}</Text> 
               </TouchableOpacity>
             )
           })
         }
       </ScrollView>
      <View style={styles.taskUpcomingView}> 
        { this._renderTimelineUpcomingTask() }
      </View>
     </View>
   )}
 }
  
 render() {
   return(
     this._renderUpcomingTask(this.props.upcomingTasks)
   )
 }
}

const styles = StyleSheet.create({
  timeLineTimeStyle: {
    textAlign: 'center', 
    color:'white', 
    borderRadius: 13,
    fontSize: 15,
    color: baseColor,
    fontFamily: "Roboto-Bold",
    marginRight: 8
  },
  shadowStyle: {
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5,
  },
  dayBubble: {
    padding: 10,
    margin: 10,
    width: 70,
    height: 70,
    borderRadius: 70/2,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  dateScrollView: {
   alignItems: "center",
   justifyContent: "center",
   fontSize: 22
  }, 
  noWorkForThisDayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: DEVICE_WIDTH - 20,
    height: DEVICE_HEIGHT / 2 
  },
  taskUpcomingView: {
    padding: 15
  }
},)

TaskUpcomingView.propTypes = {
  upcomingTasks: PropTypes.array,
  upcomingTaskData: PropTypes.array,
  upcomingTaskDateView: PropTypes.array
}