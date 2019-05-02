import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Navigation } from "react-native-navigation";
import { NOTIFICATION_SCREEN, TASK_INFO_SCREEN } from "../../constants/screen";
import { GREEN } from "../../constants/common";
import axios from "axios";
import { updateNotification } from "../../api-service/notificationAPI";

const styles = StyleSheet.create({
  notiInstance: {
    flexDirection: 'column',
    padding:15,
    margin: 10,
    justifyContent: "space-between"
  },
  titleNotification: {
    fontSize: 16, 
    fontFamily: "Roboto-Bold"
  },
  descripNotification: {
    flexDirection: "row", 
    justifyContent: "space-between"
  },
})

export default Noti = (props) => ( 
  <TouchableOpacity
    style={[styles.notiInstance,{
       borderLeftWidth: (props.seen) ? 0 : 5, 
       borderLeftColor: (props.seen) ?  'none' : GREEN 
    }]} onPress={props.onPress}>
      <View style={{flexDirection: "row", justifyContent: "space-between"}}> 
        <Text style={styles.titleNotification}>{props.title}</Text>
        <Text style={styles.titleNotification}>{props.time}</Text>
      </View>
      <View style={styles.descripNotification}>
        <Text style={{ fontSize: 15 }}>{props.description}</Text>
      </View>
  </TouchableOpacity>
)