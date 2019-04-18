import React,{ Component } from "react";
import { 
  View, 
  ProgressBarAndroid
 } from "react-native";
import MyConfigModal from "../../elements/modal";
import { Navigation } from "react-native-navigation";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../../constants/mainSetting";

export default class WaitingScreen extends Component {
  render() {
    return (
      <MyConfigModal 
        main= {
          <View style={{
            flex: 1,
            backgroundColor: "transparent", 
            justifyContent: "center", 
            alignSelf: "center",
            width:DEVICE_WIDTH,
            height: DEVICE_HEIGHT
          }}>
            <ProgressBarAndroid animating={true}/> 
          </View>
        }
      close={() => Navigation.dismissAllModals()} />
    )
  }
}