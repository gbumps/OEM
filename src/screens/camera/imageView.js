import React, { Component } from "react";
import { View, Image } from "react-native";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../../constants/mainSetting";
import { connect } from "react-redux";
import { Navigation } from "react-native-navigation";
import autobind from "class-autobind";
import Swiper from "react-native-swiper";

class ImageView extends Component {
   
  static get options() { 
    return {
      topBar: {
        visible: false 
      }, 
      bottomTabs: {
        visible: false 
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
    }   
    autobind(this)
  }

  _handleClose() {
    Navigation.dismissAllModals()
  }
  
  _renderImageSlider(list,index) { 
     if(list.length === 1) {
       return (
      <View style={{flex: 1}}> 
          <Image
            source={{uri: list[0]}}   
            style={{width: DEVICE_WIDTH, height: DEVICE_HEIGHT}} />
      </View>
     )} else {
       return (
        <Swiper 
          loop={false}
          index={index}>
          {
            list.map(imgUrls => {
              return (
                <View style={{ flex: 1 }}>
                  <Image
                    source={{uri: imgUrls}}   
                    style={{width: DEVICE_WIDTH, height: DEVICE_HEIGHT}} />
                </View>
              )
            })
          }
        </Swiper> 
       )
     } 
  }

  render() {
    return (
        this._renderImageSlider(this.props.imageList,this.props.index)
    )
  }
}

export default connect(null, null)
(ImageView);