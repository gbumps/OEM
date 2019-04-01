import React,{ Component } from "react";
import { 
  TouchableOpacity,
  Alert,
  ImageBackground, 
 } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {Navigation} from "react-native-navigation";
import { IMAGE_SCREEN } from "../constants/screen";
import { CONFIRM } from "../constants/alert";

export default ImageInstance = (props) => (
  <TouchableOpacity 
    onPress={() => {
      Navigation.showModal({
        component: {
          name: IMAGE_SCREEN.settingName,
          passProps: {
            imageList: props.imageList,
            index: props.index
          }
        }, 
      })
    }}>
    <ImageBackground 
      style={{ width: 100, height: 150, margin: 10}} source={props.imageSource}> 
       <TouchableOpacity style={{top: 0, right: 0, display: props.displayClose}}
          onPress={() => {
            Alert.alert(
               CONFIRM, 
               "Bạn có chắc chắc muốn xoá hình này ? Hành động này sẽ không được lặp lại",
            [{
              text: "Có", 
              onPress: props.onPressYes
            }])
          }}> 

          <Icon name="close" size={24} color="red" />
      </TouchableOpacity>
    </ImageBackground>
  </TouchableOpacity>
)
