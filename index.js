import { Navigation } from "react-native-navigation";
import { registerScreen } from "./screens";
import { AsyncStorage, Alert, Vibration } from "react-native";
import { 
  LOGIN_SCREEN, TASK_INFO_SCREEN,
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
  DISMISS
} from "./src/constants/common";
//import firebase from "./firebase";
import firebase from "react-native-firebase";
import { checkSession } from "./src/functions/functions";
registerScreen();

Navigation.setDefaultOptions({
  bottomTabs: {
    titleDisplayMode: "alwaysHide", // for android
    animate: false
  },
  bottomTab: {
    iconInsets: { top: 0, left: 0, bottom: 0, right: 0 },
    iconColor: "gray",
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
});
//when app start, set root screens
Navigation.events().registerAppLaunchedListener(async() => {
  //await AsyncStorage.setItem(USER.ID, "2")
  //await AsyncStorage.setItem(TOKEN, "Bearer " + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIwOTYxOTEzNDk3IiwiSldUQXV0aG9yaXRpZXNLZXkiOiJMYWJvcmVyIiwiZXhwIjoxNTU0MjIyOTQ5fQ.S4WlYZPo3pYzcgHamYmPL-pRHUbs4DqmG-ubJOMIQ2ZNdOx5ru6Dn5B2bFoO8-RN83VM_bCNtvb-a8312o5q4A")
  //await AsyncStorage.setItem("SESSION_EXPIRE_TIME", 
  //         moment(new Date()).add(moment.duration(120000).asMinutes(), "minutes").toString())
  checkSession()
  
  const userId = await AsyncStorage.getItem(USER.ID),
        token  = await AsyncStorage.getItem(TOKEN) 
  console.log('token: ', token)
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

//   let channel = new firebase.notifications.Android.Channel('channelOEM', 'Test Channel', firebase.notifications.Android.Importance.Max)
//   .setDescription('My apps test channel');

// // Create the channel
//   await firebase.notifications().android.createChannel(channel);

  firebase.messaging().getToken().then(token => {
    //console.log('token firebase: ', token)    
  })

  firebase.notifications().getInitialNotification().then(notificationOpen => {
    //trigger when app opened by tapping on notification
    //if app opened as usual way will received undefined
    const notification = notificationOpen.notification;
    //auto navigate to task info
    Navigation.showModal({
      component: {
        name: TASK_INFO_SCREEN.settingName,
        passProps: {
          taskId: notification.data.task_id,
          navigateFrom: "taskNotification",
        }
      }
    })
  }) 

  

  firebase.notifications().onNotification((notification) => {
    //trigger notification received when in-app 
    notification.android.setChannelId("channelOEM")
    notification.android.setSmallIcon('ic_launcher');
    firebase.notifications().displayNotification(notification);
    //phone vibrate 700 ms
    Vibration.vibrate(700)
    const { title, body } = notification;
    Alert.alert(title, body, [
      {
        text: SEE_TASK,
        onPress: () => {
          Navigation.showModal({
            component: {
              name: TASK_INFO_SCREEN.settingName,
              passProps: {
                taskId: notification.data.task_id,
                navigateFrom: "taskNotification",
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
//   firebase.notifications().onNotificationOpened((notificationOpen) => {
//     // Get the action triggered by the notification being opened
    
// }); 
  // try {
  //   firebase.messaging().onMessage((message) => {
  //     //process data message
  //     console.log('test message:' ,JSON.stringify(message));
  //   });
  // }catch(err) {
  //   console.log('err: ', err)
  // }
 })
