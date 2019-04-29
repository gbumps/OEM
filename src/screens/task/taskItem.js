import React from "react";
import { TouchableOpacity, View, Text,StyleSheet,Image  } from "react-native";
import { Navigation } from "react-native-navigation";
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TASK_SCREEN, TASK_INFO_SCREEN } from "../../constants/screen";
import { ABSENT, TASK_OVERDUE } from "../../constants/common";
import { DEVICE_WIDTH } from "../../constants/mainSetting";
import { fetchBaseColor } from "../../functions/functions";

const styles = StyleSheet.create({
  taskInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: DEVICE_WIDTH - 40,
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5, 
  },
  taskTitleText: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    paddingLeft: 13
  },
  taskEachInfo: { 
    flexDirection: "row",
    padding: 7 
  },
  taskNormalText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
  },
  title: {
    fontFamily:'Roboto-Bold',
    fontSize: 18,
    paddingLeft: 15,
  },
  imageTaskItem: { 
    width: 120, 
    height: 120,
    borderRadius: 120/2,
    borderWidth: 0.5,
    borderColor: "#c4c4c4",
    alignSelf: "center",
    justifyContent: "center"
  },
})

export default TaskItem = (props) => (
  <TouchableOpacity 
     key={props.id}
     style={
       [styles.taskInfo, { 
       borderLeftWidth: 7, 
       borderLeftColor: (props.attendance === ABSENT || props.status === TASK_OVERDUE) ? 
         "#f43030" : fetchBaseColor(props.status)}]}
     onPress={() => 
        Navigation.push(
         TASK_SCREEN.id, {
           component: {
             id: TASK_INFO_SCREEN.id,
             name: TASK_INFO_SCREEN.settingName,
             passProps: {
               taskId: props.id,
               navigateFrom: TASK_SCREEN.id
             }
           }
       })}>
     <View>
       <Text style={[styles.taskTitleText, {
         color: (props.attendance === ABSENT || props.status === TASK_OVERDUE) ? 
         "#f43030" : fetchBaseColor(props.status)
       }]}>
         {props.id + " - " + props.title}
       </Text>
       <View style={styles.taskEachInfo}>
         <Icon name="building" size={20} color="black"/>
         <Text style={[styles.title, styles.taskNormalText]}>
           {props.companyName}
         </Text>
       </View>
       <View style={styles.taskEachInfo}>
         <MaterialIcons name="location-on" size={20} color="black"/>
         <Text style={[styles.title, styles.taskNormalText]}>
           {props.companyAddress}
         </Text>
       </View>
       <View style={styles.taskEachInfo}>
         <AntDesign name="clockcircle" size={20} color="black"/>
         <Text style={[styles.title, styles.taskNormalText]}>
           {props.workTime}
         </Text>
       </View>
     </View>
     <Image style={styles.imageTaskItem} source={{uri: props.imageCompany}}/>
 </TouchableOpacity>
)

