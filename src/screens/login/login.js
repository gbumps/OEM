import React,{ Component } from "react";
import { connect } from "react-redux";
import {
  KeyboardAvoidingView,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  ToastAndroid,
  AsyncStorage,
  Text,
  TouchableOpacity,
  ProgressBarAndroid,
  Platform,
  Keyboard, 
  TouchableWithoutFeedback,
  Vibration
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import DeviceInfo from "react-native-device-info";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { 
  CONTENT_TYPE, 
  USER, TOKEN, 
  PHONENUMBER, IOS, 
  SESSION_EXPIRE_TIME, 
  HELLO_HAVE_A_NICE_DAY,
  HELLO_INPUT_PASSWORD_TO_CONTINUE,
  HELLO_WELCOME_TO_OEM,
  ANDROID,
  GRADIENT_COLOR,
  PROMT_INPUT_PASSWORD,
  SYSTEM_SOUND_STATE,
} from "../../constants/common";
import { 
  NOTIFICATION, 
  ERR_PHONE_NUMBER_NOT_FOUND, 
  ERR_NO_PASS, ERR_NO_ACCOUNT, 
  ERR_WRONG_PASSWORD, 
  ERR_INTERNET_CONNECTION, 
  ERR_SERVER_ERROR,
  ERR_PHONE_NUMBER_NOT_FOUND_IOS,
  ERR_FINGERPRINT_AUTHEN_NOT_MATCH,
  ERR_FINGERPRINT_NOT_SET,
  ERR_FINGERPRINT_NOT_SUPPORTED,
  ERR_FINGERPRINT_TRY_AGAIN
} from "../../constants/alert";
import axios from "axios";
import { requestPhoneNumber, requestLoginURL } from "../../api-service/loginAPI";
import autobind from "class-autobind";
import { baseColor, baseFontColor } from "../../constants/mainSetting";
import { requestAccountByPhoneNumber, requestUpdateUserInfo } from "../../api-service/userAPI";
import renderBottomTab from "../../elements/bottomTab";
import { Navigation } from "react-native-navigation";
import firebase from "react-native-firebase";
import moment from "moment";
import RNExitApp from "react-native-exit-app";
import FingerprintScanner from 'react-native-fingerprint-scanner';
import * as Keychain from 'react-native-keychain';
import { FINGERPRINT_SCREEN } from "../../constants/screen";

class Login extends Component {
  //options for navigation
  static get options() {
    return {
      topBar: {
        visible: false,
      }
    }
  }

  //contructors
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      phoneNumber: "",
      password: "",
      welcomeText: "",
      scanFingerprintView: "none", 
    }
   autobind(this)
  }
  
  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
  }

  _showErrorMessage(message) {
    if (Platform.OS === ANDROID) {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
    else {
      Alert.alert(NOTIFICATION, message)
    }
  }
  //called after view is rendered
  async componentDidMount() {
    let arr = [
      HELLO_HAVE_A_NICE_DAY, 
      HELLO_INPUT_PASSWORD_TO_CONTINUE,
      HELLO_WELCOME_TO_OEM
    ]
    this.setState({
      welcomeText: arr[Math.floor(Math.random() * arr.length) + 0]
    })
    let macAddress = ""
    macAddress = await DeviceInfo.getMACAddress()
    axios.get(requestPhoneNumber(macAddress)).then(phoneNumber => {
      if (phoneNumber.data === "") {
        let errMessage = (Platform.OS === IOS) ? 
            ERR_PHONE_NUMBER_NOT_FOUND_IOS + macAddress : ERR_PHONE_NUMBER_NOT_FOUND
        Alert.alert(NOTIFICATION, errMessage ,[], {
          onDismiss: async () => {
            RNExitApp.exitApp()
          }
        })
        return;
      } else {
        this.setState({
          phoneNumber: phoneNumber.data
        })
      }
    }).catch(err => {
      console.log("err: ", err)
      this._showErrorMessage(ERR_SERVER_ERROR)
    })
    const credential = await Keychain.getGenericPassword()
    if (credential) {
      this.setState({
        scanFingerprintView: "flex"
      })
    }
  }

   _checkCondition() {
    if (this.state.password === "") {
      this._showErrorMessage(ERR_NO_PASS)
      return false
    }
    else if (this.state.phoneNumber === "") {
      this._showErrorMessage(ERR_NO_ACCOUNT)
      return false
    } 
    return true
   }

   async _setUserData(userData, token, timeExpired) {
      const today = moment(new Date()), 
            duration = moment.duration(timeExpired).asMinutes()
      await AsyncStorage.setItem(USER.ID, String(userData.id))
      await AsyncStorage.setItem(TOKEN, String(token))
      await AsyncStorage.setItem(PHONENUMBER, String(this.state.phoneNumber))
      await AsyncStorage.setItem(SESSION_EXPIRE_TIME, today.add(duration, "minutes").toString())
      await AsyncStorage.setItem(SYSTEM_SOUND_STATE, "true")
      const tokenFirebase = await firebase.messaging().getToken()
      const link = requestUpdateUserInfo(userData.id)
      axios({
        url: link,
        method: "PUT",
        data: {
          "key": "tokenFirebase",
          "value": tokenFirebase
        },
        headers: {
          Authorization: token
        }
      })
   }

   _activateFingerprint() {
    Navigation.showModal({
      component: {
        name: FINGERPRINT_SCREEN.settingName,
        options: {
          layout: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          screenBackgroundColor: 'transparent',
          modalPresentationStyle: 'overCurrentContext',
        }
    }})
    FingerprintScanner.authenticate({onAttempt: (t) => this._onfingerPrintAttempt(t.name)})
    .then(async () => {
      console.log("scan successfully !")
      const credential = await Keychain.getGenericPassword()
      Navigation.dismissAllModals()
      if (credential) {
        this.setState({
          username: credential.username,
          password: credential.password
        })
      }
      this._handleLogin()
    }).catch((error) => {
      if (error.name == "DeviceLocked") { 
        Navigation.dismissAllModals()
        this._showErrorMessage(ERR_FINGERPRINT_TRY_AGAIN)
      }
      Vibration.vibrate(500)
    });
   }

   _onfingerPrintAttempt(name) {
      switch(name) {
        case "AuthenticationNotMatch":
          this._showErrorMessage(ERR_FINGERPRINT_AUTHEN_NOT_MATCH)
          Vibration.vibrate(500)
          break;
        case "PasscodeNotSet": 
          this._showErrorMessage(ERR_FINGERPRINT_NOT_SET)
          return;
        case  "FingerprintScannerNotAvailable":
          this._showErrorMessage(ERR_FINGERPRINT_NOT_SUPPORTED)
          return;
      }
   }
   
   componentWillUnmount() {
     FingerprintScanner.release()
   }

   _navigateToMainPage(userId) {
      Navigation.setRoot({
        root: {
          bottomTabs: renderBottomTab({userId: userId})
        }
      })
   }

  //other functions 
  async _handleLogin() {
    const submitLink = requestLoginURL();
    if (this._checkCondition()) {
      await Keychain.setGenericPassword(this.state.phoneNumber, this.state.password)
      axios({
        url: submitLink,
        method: "POST",
        data: {
          "username": this.state.phoneNumber,
          "password": this.state.password
        },
        headers: {
          "Content-Type": 'application/json', 
        }
      })
      .then((res) => {
        const token = "Bearer " + res.data.token
        const expiredTime = res.data.expired_time
        axios.get(requestAccountByPhoneNumber(this.state.phoneNumber),{
          headers: {
            "Content-Type": 'application/json',
            Authorization: token,
          }
        }).then(userData => {
          this._setUserData(userData.data, token, expiredTime)
          this._navigateToMainPage(userData.data.id)
        })
      }).catch(err => {
        console.log('err: ', err.response.status)
        switch(err.response.status) {
        case 401:
          this._showErrorMessage(ERR_WRONG_PASSWORD)
          break 
        case 404: 
          this._showErrorMessage(ERR_INTERNET_CONNECTION)
          break;
        case 500:
        case 502: 
          this._showErrorMessage(ERR_SERVER_ERROR)
          break
        }
      })
    }
  }

  //render view 
  render() {
    return (
      <KeyboardAvoidingView behavior="padding" style={{flex: 1}} enabled>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <LinearGradient 
          start={{x: 0, y: 1}} end={{x: 0, y: 0}} 
          colors={GRADIENT_COLOR} 
          style={styles.container}>
            <Image source={require('../../assets/icon/welcomeLogo.png')} />
              <Text style={styles.phoneNumberText}>
                {this.state.welcomeText}
              </Text>
            <TextInput 
              placeholderTextColor={"#ccc"}
              secureTextEntry={true} 
              placeholder={PROMT_INPUT_PASSWORD}
              keyboardType="numeric"
              style={styles.textInputStyle} 
                value={this.state.password}
                onChangeText={(text) => this.setState({
                  password: text
                })}
            /> 
            {
              (this.state.isLoggedIn) ? 
              <ProgressBarAndroid animating={true} color="white"/> :
              <TouchableOpacity
                onPress={this._handleLogin}
                style={styles.loginButtonStyle}> 
                <Text style={styles.titleLoginButtonStyle}> ĐĂNG NHẬP </Text> 
                <MaterialIcons name="navigate-next" size={25} color={baseColor}/>
              </TouchableOpacity> 
            }
            <TouchableOpacity style={{
              flexDirection: "row", 
              display: this.state.scanFingerprintView, 
              justifyContent: "space-evenly"
            }} 
            onPress={this._activateFingerprint}
             >
              <MaterialIcons name="fingerprint" size={28} color={baseFontColor}/>
              <Text style={{color: baseFontColor, fontSize: 20}}>Đăng nhập bằng vân tay</Text>
            </TouchableOpacity>
        </LinearGradient> 
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  phoneNumberText: {
    fontSize: 22,
    color: "white",
    textAlign: "center",
    fontFamily: "Roboto-Black"
  },
  textInputStyle: {
    borderBottomWidth: 1.5,
    borderBottomColor: "white",
    backgroundColor: "transparent",
    width: 250,
    color: "white",
    fontSize: 20,
    justifyContent: "center",
    margin: 12
  },
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
  },
  titleStyle: {
    fontFamily: 'Lato-Bold',
    fontSize: 20
  },
  loginButtonStyle: {
    flexDirection: "row",
    backgroundColor:"white",
    width: 250,
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  titleLoginButtonStyle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: baseColor
  }
})

export default connect(
  null, 
  null 
)(Login)