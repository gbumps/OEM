import React,{ Component } from "react";
import { 
  View, 
  Text,
  TextInput,
  AsyncStorage, 
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert
 } from "react-native";
import { DEVICE_WIDTH, baseColor} from "../../constants/mainSetting";
import autobind from "class-autobind";
import { CONTENT_TYPE, AUTHORIZATION, TOKEN, GREEN, PHONENUMBER, USER, YELLOW_ORANGE, RETYPE_OLD_PASS, TYPE_NEW_PASS, RETYPE_NEW_PASS } from "../../constants/common";
import axios from "axios";
import { CHANGE_PASSWORD_SCREEN, LOGIN_SCREEN } from "../../constants/screen";
import renderStatusBar from "../../elements/statusBar";
import renderTopTab from "../../elements/topTab";
import { requestLoginURL } from "../../apis/loginAPI";
import { 
  ERR_WRONG_PASSWORD, 
  ERR_RETYPE_PASS_DONT_MATCH, 
  ERR_INTERNET_CONNECTION, 
  NOTIFICATION, REQUIRE_RELOGIN, 
  REQUIRE_FIELD_VALIDATOR, 
  ERR_SERVER_ERROR
} from "../../constants/alert";
import { Navigation } from "react-native-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { requestUpdatePassword } from "../../apis/userAPI";

export default class ChangePassword extends Component {
   
  static get options() {
    return {
      statusBar: renderStatusBar(true),
      topBar: renderTopTab(CHANGE_PASSWORD_SCREEN),
    }    
  }
  constructor(props) {
    super(props)
    this.state = {
      phoneNumber: "",
      oldPassword: "", 
      newPassword: "",
      retypePass: ""
    }
    autobind(this)        
  }

  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[AUTHORIZATION] =await AsyncStorage.getItem(TOKEN)
    const phoneNumber = await AsyncStorage.getItem(PHONENUMBER)
    this.setState({
      phoneNumber: phoneNumber
    })
  }
 
  _showToastAndroid(message) {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    )
  }

  _handleChangePassword() {
    if (this.state.oldPassword === "" || 
    this.state.newPassword === "" || 
    this.state.retypePass === "") {
      this._showToastAndroid(REQUIRE_FIELD_VALIDATOR)
      return;
    }
    if (this.state.newPassword !== this.state.retypePass) {
      this._showToastAndroid(ERR_RETYPE_PASS_DONT_MATCH)
      return;
    }
    const submitLink = requestUpdatePassword();
    axios({
      url: submitLink,
      method: "PUT",
      data: {
        "newPassword": this.state.newPassword,
        "username": this.state.phoneNumber,
        "oldPassword": this.state.oldPassword
     }
   }).then((res) => { 
      if (res.data) {
        Alert.alert(NOTIFICATION,REQUIRE_RELOGIN,[],{
          onDismiss: async () => {
            await AsyncStorage.multiRemove([USER.ID, TOKEN, PHONENUMBER])
            await Navigation.setRoot({
               root: {
                 component: {
                   name: LOGIN_SCREEN.settingName
                 }
               }
            })
          }
        })
      }
      else {
        this._showToastAndroid(ERR_WRONG_PASSWORD + " cũ")
      }
  }).catch(err => {
   switch(err.response.status) {
   case 404: 
      this._showToastAndroid(ERR_INTERNET_CONNECTION)
      break;
   case 500: 
   case 502:
      this._showToastAndroid(ERR_SERVER_ERROR);
      break
   }
 })
}

  render() {
    return( 
      <View style={styles.container}>
        <View style={styles.inputPassContainer}>
          <View style={ styles.textBoxPassword }>
            <MaterialCommunityIcons name="textbox-password" size={24} color={YELLOW_ORANGE}/>          
            <TextInput 
              placeholderTextColor={"#ccc"}
              secureTextEntry={true} 
              placeholder={RETYPE_OLD_PASS}
              keyboardType="numeric"
              style={styles.textInputStyle} 
                value={this.state.oldPassword}
                onChangeText={(text) => this.setState({
                  oldPassword: text
                })}
            /> 
          </View>
        <View style={styles.textBoxPassword}>
          <MaterialCommunityIcons name="textbox-password" size={24} color={GREEN}/>
          <TextInput 
            placeholderTextColor={"#ccc"}
            secureTextEntry={true} 
            placeholder={TYPE_NEW_PASS}
            keyboardType="numeric"
            style={styles.textInputStyle} 
              value={this.state.newPassword}
              onChangeText={(text) => this.setState({ newPassword: text })}
          /> 
        </View>
        <View style={styles.textBoxPassword}>
            <MaterialCommunityIcons name="textbox-password" size={24} color={baseColor}/>
            <TextInput 
              placeholderTextColor={"#ccc"}
              secureTextEntry={true} 
              placeholder={RETYPE_NEW_PASS}
              keyboardType="numeric"
              style={styles.textInputStyle} 
              value={this.state.retypePass}
              onChangeText={(text) => this.setState({
                retypePass: text
              })}
            />  
        </View>
        </View>
        <View style={styles.buttonApproveChangePassword}>
          <TouchableOpacity
            style={ styles.buttonApprove } 
            onPress={ this._handleChangePassword }>
            <Text style={{color: "white", fontSize: 20}}>Lưu mật khẩu mới</Text>
          </TouchableOpacity> 
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputPassContainer: {  
    padding: 20
  },
  textBoxPassword: {
    flexDirection: "row", 
    alignItems: "center"
  },
  buttonApproveChangePassword: {
    position: "absolute",
    bottom: 0,
    alignSelf:'center',
    width: DEVICE_WIDTH
  }, 
  textInputStyle: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#ccc",
    backgroundColor: "white",
    width: DEVICE_WIDTH - 50,
    color: "black",
    fontSize: 18,
    justifyContent: "center",
    margin: 12  
  },
  buttonApprove: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 10,
    backgroundColor: GREEN,
  },
  container: {
    flex: 1,
    alignItems:'center',
    flexDirection: 'column',
  }, 
})