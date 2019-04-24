import React,{ Component } from "react";
import { connect  } from "react-redux";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet, 
  Dimensions,
  AsyncStorage,
  ScrollView,
  Linking, 
  RefreshControl
} from 'react-native';
import { OPTION_SCREEN, LOGIN_SCREEN, CHANGE_PASSWORD_SCREEN } from "../../constants/screen";
import { Navigation } from "react-native-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { USER, ROLE, TOKEN, CONTENT_TYPE, AUTHORIZATION, YES, NO, YELLOW_ORANGE, GREY, PHONENUMBER, SESSION_EXPIRE_TIME, BIRTHDAY, ADDRESS, MANAGER, PHONE_NUMBER_MANAGER } from "../../constants/common"
import { DEVICE_WIDTH, baseColor } from "../../constants/mainSetting";
import axios from "axios";
import { requestUserInfoURL } from "../../api-service/userAPI";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import BackgroundTimer  from "react-native-background-timer";


const Touchable = (props) => (
  <TouchableOpacity
   style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: 15
   }}
   onPress={props.onPress}>
    <View style={{ flexDirection: "row" }}>
      {props.iconLeft}
      <Text style={{
         fontSize: 18, 
         paddingLeft: 20, 
         fontFamily: "Roboto-Bold"
      }}>{props.field}</Text>
    </View>
    <Text style={{
      fontSize: 18,
      color: "#c1c1c1",
      paddingRight: 20
    }}>{props.text}</Text>
  </TouchableOpacity>
)

class Option extends Component {

  constructor(props) {
    super(props)
    this.state = {
       userInfo: {},
       managerInfo: {}, 
       refreshing: false
    }
  }
  
  
  async _loadUserInfo() {
    const id = await AsyncStorage.getItem(USER.ID)
    console.log('link: ', requestUserInfoURL(id))
    const userInfo = await axios.get(requestUserInfoURL(id),{})
    if (userInfo.data !== undefined) {
      this.setState({ 
        userInfo: userInfo.data
      })
      const managerInfo= await axios.get(requestUserInfoURL(userInfo.data.managerId))
      this.setState({
        managerInfo: managerInfo.data
      })
    } else {
      
    }
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this._loadUserInfo()
    this.setState({
      refreshing: false
    })
  }

  async componentWillMount() {
    axios.defaults.headers.common[CONTENT_TYPE] = "application/json"
    axios.defaults.headers.common[AUTHORIZATION] =await AsyncStorage.getItem(TOKEN)
  }

  async componentDidMount() {
    this._loadUserInfo()
    this.navigationEventListener = Navigation.events().bindComponent(this);
  }

  //render view
  render() {
    return (
        <ScrollView  
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          } 
          alwaysBounceVertical={true}>
          <View style={styles.container}>
            <Image style={styles.userInfoImage} 
              source={{uri: this.state.userInfo.picture}} />
            <Text style={styles.userInfoFullName}> 
               {this.state.userInfo.fullName}
            </Text>
          </View>
          <Touchable 
            iconLeft={<FontAwesome name="birthday-cake" size={22} color={RED}/>}
            field={BIRTHDAY}
            text={moment(this.state.userInfo.birthDate).format("DD/MM/YYYY")}
          />
          <Touchable 
            iconLeft={<FontAwesome name="home" size={22} color={baseColor}/>}
            field={ADDRESS}
            text={ 
              (this.state.userInfo.address !== undefined && this.state.userInfo.address.length >= 25) ? 
              this.state.userInfo.address.substring(0,20) + "..." : 
              this.state.userInfo.address
            }
            />
          <Touchable 
            iconLeft={<FontAwesome name="vcard" size={22} color={VIOLET}/>}
            field={MANAGER}
            text={(this.state.managerInfo.fullName === undefined) ? 
            "Không có thông tin" : this.state.managerInfo.fullName }/>
          <Touchable 
            iconLeft={<FontAwesome name="phone" size={22} color={GREEN}/>}
            field={PHONE_NUMBER_MANAGER}
            text={(this.state.managerInfo.phoneNumber === undefined) ? 
            "Không có thông tin" : this.state.managerInfo.phoneNumber }
            onPress={ ()=>{Linking.openURL('tel:' + this.state.managerInfo.phoneNumber )} }
            />
          <Touchable 
            iconLeft={<MaterialCommunityIcons name="textbox-password" size={22} color={YELLOW_ORANGE}/>}
            field="Đổi mật khẩu"
            onPress={() => {
              Navigation.push(OPTION_SCREEN.id, {
                component: {
                  name: CHANGE_PASSWORD_SCREEN.settingName,
                }
              })
            }}
            />
          <Touchable 
            iconLeft={<SimpleLineIcons name="logout" size={22} color={GREY}/>}
            field="Đăng xuất"
            text={""}
            onPress={() => 
            Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất ?',[{
                text: YES, 
                onPress: async () => {
                  BackgroundTimer.stopBackgroundTimer()
                  await AsyncStorage.multiRemove([USER.ID, TOKEN,PHONENUMBER, SESSION_EXPIRE_TIME])
                  await Navigation.setRoot({
                     root: {
                       component: {
                         name: LOGIN_SCREEN.settingName
                       }
                     }
                  })
                }
              },{
                text: NO,
                onPress: () => console.log('Canceled pressed')
              }
            ])}
            /> 
        </ScrollView>
    )
  }
}

const GREEN = "#00a351",  
      PINK = "#c100b1",
      RED = "#d60000",
      VIOLET = "#a102e0"

const styles = StyleSheet.create({
  containerButton: {
    width: Dimensions.get('window').width,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  text: {
    fontFamily: 'Lato-Bold',
    color: 'rgb(66, 134, 244)',
    fontSize: 15
  },
  userInfoImage: {
    width: 200, 
    height: 200, 
    borderRadius: 200/2,
  },
  container:{ 
    justifyContent: "space-evenly",
    alignItems: "center",
    width: DEVICE_WIDTH,
    height: 400,
    padding: 20
  },
  userInfoFullName:{
    fontFamily: "Roboto-Black",
    fontSize: 30
  }
})

function mapStateToProps(state) {
 return {
   
 }
}

function mapDispatchToProps(dispatch) {
 return {
    //logout: bindActionCreators(logoutActions,dispatch)
 }
}

export default connect(
  mapStateToProps, 
  mapDispatchToProps
)(Option)