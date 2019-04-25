import { Navigation } from "react-native-navigation";
import { registerScreen } from "./screens";
import { AsyncStorage, Alert, Vibration } from "react-native";
import { 
  LOGIN_SCREEN, TASK_INFO_SCREEN, MAP_SCREEN, NOTIFICATION_SCREEN, TASK_SCREEN,
} from "./src/constants/screen";
import { 
  DEVICE_WIDTH, 
  baseColor,
} from "./src/constants/mainSetting";
import renderBottomTab from "./src/elements/bottomTab";
import { 
  USER, 
  TOKEN, 
  TASK_REPORT_PROBLEM_TEMP,
  TASK_IN_PROGRESS_TEMP_ID,
  TASK_REPORT_WORK_DESCRIPTION_TEMP,
  TASK_REPORT_PROBLEM_DESCRIPTION_TEMP,
  TASK_REPORT_WORK_TEMP,
  SEE_TASK,
  DISMISS,
  TASK_NOTIFICATION,
  CHANNEL_NOTIFICATION_OEM,
  IC_LAUNCHER,
  SYSTEM_SOUND_STATE,
} from "./src/constants/common";
import firebase from "react-native-firebase";
import { checkSession } from "./src/functions/functions";
import { updateNotification } from "./src/api-service/notificationAPI";
import axios from "axios";
import { SOUND_NOTI_BTN } from "./src/constants/navBtn";

registerScreen();

Navigation.setDefaultOptions({
  bottomTabs: {
    titleDisplayMode: "alwaysHide", // for android
    animate: false
  },
  bottomTab: {
    iconInsets: { top: 0, left: 0, bottom: 0, right: 0 },
    disableIconTint: true,
    selectedIconColor: baseColor,
  },
  layout: {
    backgroundColor: 'white',
    orientation: "portrait"
  },
  animations: {
    setRoot: {
      enabled: "true", // Optional, used to enable/disable the animation
      alpha: {
        from: 0,
        to: 1,
        duration: 400,
        startDelay: 100,
        interpolation: "accelerate"
      }
    },
    push: {
      content: {
        x: {
          from: DEVICE_WIDTH,
          to: 0,
          duration: 200,
          interpolation: 'accelerate',
        }
      }
    },
    pop: {
      content: {
        x: {
          from: 0,
          to: DEVICE_WIDTH,
          duration: 200,
          interpolation: 'accelerate',
        }
      }
    },
    showModal:{
      alpha: {
        from: 0,
        to: 1
      }
    },
    dismissModal: {
      alpha: {
        from: 1,
        to: 0
      }
    }
  }
})

//when app start, set root screens
Navigation.events().registerAppLaunchedListener(async() => {
  checkSession()
  
  //await AsyncStorage.setItem(SYSTEM_SOUND_STATE, "")
  const userId = await AsyncStorage.getItem(USER.ID),
        token  = await AsyncStorage.getItem(TOKEN) 
  //console.log('token: ', token)
  await AsyncStorage.multiRemove([
    TASK_REPORT_PROBLEM_TEMP, 
    TASK_IN_PROGRESS_TEMP_ID, 
    TASK_REPORT_WORK_DESCRIPTION_TEMP,
    TASK_REPORT_PROBLEM_DESCRIPTION_TEMP,
    TASK_REPORT_WORK_TEMP
  ])
  if (userId !== null && token !== null) {
    Navigation.setRoot({
      root: {
        bottomTabs: renderBottomTab({userId: userId})
      }
    }) 
  } 
  else {
    Navigation.setRoot({ 
      root: {
        component: {
          name: LOGIN_SCREEN.settingName
        }
      }
    })
  }
  
  firebase.messaging().getToken().then(token => {
  })

  const soundState = await AsyncStorage.getItem(SYSTEM_SOUND_STATE)
  Navigation.mergeOptions(NOTIFICATION_SCREEN.id, {
    topBar: {
      rightButtons: [{
        id: SOUND_NOTI_BTN,
        icon: (soundState == "true") ? require("./src/assets/icon/speaker.png") : require("./src/assets/icon/speakerMute.png"),
        color: baseColor
      }]
    }
  })

  // if (soundState == "true") {
  //   axios({
  //     url: requestTranslate,
  //     method: "POST",
  //     data: returnDataRequest(SOUND_CHECK_ATTENDANCE_SUCCESS)
  //   }).then(t => {
  //     const path = `${RNFS.DocumentDirectoryPath}/checkAttend.mp3`
  //     RNFS.writeFile(path, t.data.audioContent, 'base64').then(() => playSound(path))
  //   }).catch(err => console.log(err))
  // } 
  
  Navigation.events().registerBottomTabSelectedListener(({ unselectedTabIndex}) => {
    switch (unselectedTabIndex) {
      case 0:
        Navigation.popToRoot(TASK_SCREEN.id,{})
        break;
      case 1: 
        Navigation.popToRoot(MAP_SCREEN.id,{})
        break;
      case 2:
        Navigation.popToRoot(NOTIFICATION_SCREEN.id,{})
        break;
    }
  });

  firebase.notifications().getInitialNotification().then(notificationOpen => {
    //trigger when app opened by tapping on notification
    //if app opened as usual way will received undefined
    const notification = notificationOpen.notification;
    //auto navigate to task info
    axios({ 
      url: updateNotification(notification.data.notify_id),
      method: "PUT",
      data:{
        key: "seen",
        value: true
      },
    })
    Navigation.showModal({
      component: {
        name: TASK_INFO_SCREEN.settingName,
        passProps: {
          taskId: notification.data.task_id,
          navigateFrom: TASK_NOTIFICATION,
        }
      }
    })
  }) 

  firebase.notifications().onNotification((notification) => {
    //trigger notification received when in-app 
    notification.android.setChannelId(CHANNEL_NOTIFICATION_OEM)
    notification.android.setSmallIcon(IC_LAUNCHER);
    firebase.notifications().displayNotification(notification);
    //phone vibrate 700 ms
    Vibration.vibrate(700)
    const { title, body } = notification;
    //console.log('notification: ',notification)
    Alert.alert(title, body, [
      {
        text: SEE_TASK,
        onPress: () => {
          axios({ 
            url: updateNotification(notification.data.notify_id),
            method: "PUT",
            data:{
              key: "seen",
              value: true
            },
          })
          Navigation.showModal({
            component: {
              name: TASK_INFO_SCREEN.settingName,
              passProps: {
                taskId: notification.data.task_id,
                navigateFrom: TASK_NOTIFICATION,
              }
            }
          })
        }
      },{
        text: DISMISS, 
        onPress:() => {
           console.log("User canceled pressed !")
        }
      }
    ])
  })
})
