import React,{ Component } from "react";
import { 
  View, 
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform, 
 } from "react-native";
import { RNCamera } from "react-native-camera";
import { connect } from "react-redux";
import { DEVICE_HEIGHT, DEVICE_WIDTH, ORIENTATION } from "../../constants/mainSetting";
import { Navigation } from "react-native-navigation";
import MyConfigModal from "../../elements/modal";
import autobind from "class-autobind";
import Icon from "react-native-vector-icons/FontAwesome"
import { IOS, ANDROID } from "../../constants/common";
import { CONFIRM, ERR, ACCESS_CAMERA } from "../../constants/alert";
import { bindActionCreators } from "redux"
import * as cameraActions from "../../actions/cameraAction";


class Camera extends Component {
  static get options() {
     return {
       topBar: {
         visible: false,
       }
     }
  }
  
  constructor(props) {
    super(props)
    this.state={
      orientation: "",    //set device orientation 
      imgUri: "",         //img uri in device
      description: "",
      progress: false,    //true => show loading animation, false otherwise
      progressIOS: 0, 
      capture: 'flex'      //for iOS
    }
    autobind(this)        //bind all methods except some component lifecycle
  }

  _setOrientation() {
    this.setState({
      orientation: (DEVICE_WIDTH > DEVICE_HEIGHT) ? 
        ORIENTATION.LANSCAPE : ORIENTATION.PORTRAIT
    })
  }

  _handleClose = () => {
    Navigation.dismissAllModals()
  }

  

  _handleTakePicture = async () => {
    try {
      if (this.camera) {
        this.setState({
          progress: true,
          capture: 'none',          
        })
        const data = await this.camera.takePictureAsync(cameraOptions)
        // if (Platform.OS === IOS) {
        //   while (this.state.progressIOS !== 1) {
        //     setTimeout(() => this.setState({
        //       progressIOS: this.state.progressIOS + 0.1
        //     }), 200)
        //   }
        // }
        this.setState({
          progress: false,
        })
        this.props.camera.toggleSave(data.uri)
        Navigation.dismissAllModals()
      }
    } catch (err) {
      console.log('err: ', err)
    }
  }

  _renderCameraView() {
     return (
     <MyConfigModal 
        main={
          <View style={styles.container}>
            <RNCamera 
              ref={ref => {this.camera = ref}}
              style={styles.cameraView}
              captureAudio={false}
              type={RNCamera.Constants.Type.back}
              playSoundOnCapture={true}
              permissionDialogTitle={CONFIRM}
              permissionDialogMessage={ACCESS_CAMERA} >
              <View style={styles.viewAbsoluteFromCameraView}>
                <TouchableOpacity 
                  style={styles.topTab}
                  onPress={this._handleClose}>
                    <Icon name="backward" size={24} color="white" />
                </TouchableOpacity>
                {
                  Platform.OS === ANDROID ? 
                  <ProgressBarAndroid animating={this.state.progress}/> :
                  <View/> 
                }
                <View style={{justifyContent: "center"}}>
                  <TouchableOpacity 
                    style={[styles.captureButton, {display: this.state.capture}]}
                    onPress={this._handleTakePicture}>
                      <Icon name="circle" size={60} color="white" />
                  </TouchableOpacity> 
                </View>
              </View>
            </RNCamera>
          </View>
        } 
        visible={true}
        cancel={this._handleClose}> 
      </MyConfigModal> 
    )
} 


  componentDidMount() {
    this._setOrientation()
    Dimensions.addEventListener('change', () => 
      this._setOrientation()
    )
  }

   
  render() {
    return(
      this._renderCameraView()
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  topTab: {
    padding: 15,
  },
  cameraView: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
  },
  viewAbsoluteFromCameraView: {
    height: DEVICE_HEIGHT - 50,
    width: DEVICE_WIDTH,
    position: 'absolute',
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    top: 0
  },
  captureButton: {
    width: DEVICE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
})

const cameraOptions = { 
  quality: 0.2, 
  fixOrientation:true, // android
  forceUpOrientation: true, //ios
  orientation: ORIENTATION.PORTRAIT,
};


const mapDispatchToProps = (dispatch) => {
  return {
    camera: bindActionCreators(cameraActions, dispatch)
  }
}

export default connect(
  null,
  mapDispatchToProps
)(Camera)
