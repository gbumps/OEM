import { Navigation } from "react-native-navigation";
import { AsyncStorage, Alert } from "react-native";
import { 
  TASK_NOT_START, 
  TASK_IN_PROGRESS, 
  TASK_WAITING_FOR_APPROVE, 
  GREEN, 
  SESSION_EXPIRE_TIME,
  USER,
  TOKEN,
  PHONENUMBER
} from "../constants/common";
import { baseColor } from "../constants/mainSetting";
import moment from "moment";
import { SESSION_EXPIRED, NOTIFICATION } from "../constants/alert";
import { LOGIN_SCREEN } from "../constants/screen";
//register component to stack
export function registerComponent(
  componentSetting, 
  component, 
  provider,
  store
  ) { 
    Navigation.registerComponentWithRedux(
      componentSetting,
      () => component,
      provider, 
      store
    )
}

export const fetchBaseColor = (status) => {
  return status === TASK_NOT_START 
          ? "#aaaaaa" : 
         status === TASK_IN_PROGRESS ? 
          "#ffa500":
        status === TASK_WAITING_FOR_APPROVE ?
          baseColor :
          GREEN
}

export const compareTimeToCurrent = (timeCompare) =>  {
  _compareTimeToCurrent(timeCompare) 
    var current = moment(new Date()),
        timeM = moment(new Date(timeCompare.replace(ZONE_TIME,"Z"))),
        differenceInMs = timeM.diff(current ,"minutes")
        // console.log('time pass: ', time)
        // console.log('current time: ', current)
        // console.log('moment time: ', timeM)
    return differenceInMs
}

export const checkSession = async () => {
  const localTime = moment(new Date())
  const timeExpired = moment(await AsyncStorage.getItem(SESSION_EXPIRE_TIME))
  //console.log(localTime.toString(), timeExpired.toString())
    if (timeExpired.diff(localTime) < 0) {
      Alert.alert(NOTIFICATION,SESSION_EXPIRED,[],{
        onDismiss: async () => {
          await AsyncStorage.multiRemove([USER.ID, TOKEN, PHONENUMBER, SESSION_EXPIRE_TIME])
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
} 

//push modal 

