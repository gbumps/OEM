import React,{ Component } from "react";
import { 
  View, 
  Text
 } from "react-native";
import MyConfigModal from "../../elements/modal";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Navigation } from "react-native-navigation";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../../constants/mainSetting";

export default class FingerprintScreen extends Component {

   constructor(props) {
       super(props)
   }
  render() {
    return (
      <MyConfigModal
        visible={true}
        cancel={() => Navigation.dismissAllModals()}
        main={
          <View style={{
            backgroundColor: "white", 
            justifyContent: "center", 
            alignItems: "center", 
            alignSelf: "center",
            height: 150,
            width: DEVICE_WIDTH - 50,
            borderRadius: 50,
            bottom: DEVICE_HEIGHT / 2 + 150,
            top: DEVICE_HEIGHT / 2 - 150
          }}>
            <MaterialIcons name="fingerprint" size={45} color="#9b16f9"/>
            <View style={{
              alignItems: "center",
              justifyContent: "center"
            }}> 
             <Text style={{fontWeight: "bold"}}>Vân tay cho OEM</Text>
             <Text>Sử dụng vân tay để đăng nhập vào hệ thống</Text>
            </View>
          </View>
        }
      close={() => Navigation.dismissAllModals()} />
    )
  }
}