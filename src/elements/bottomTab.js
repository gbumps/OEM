import { 
  TASK_SCREEN,
  NOTIFICATION_SCREEN,
  OPTION_SCREEN,
  EMPLOYEE_SCREEN,
  MAP_SCREEN
} from "../constants/screen";
import renderTopTab from "./topTab";
import renderStatusBar from "./statusBar";
import renderBottomTabIcon from "./bottomTabIcon";

export default renderBottomTab = (passProp) => ({
    children: [{
      stack: {
        children: [
          {
            component: {
              id: TASK_SCREEN.id,
              name: TASK_SCREEN.settingName,
              options: {
                statusBar: renderStatusBar(true),
                topBar: renderTopTab(TASK_SCREEN), 
                bottomTab: renderBottomTabIcon(TASK_SCREEN)
              },
              passProps: passProp
            }
          }
        ]
      }
    }, 
    {
      stack: {
        children: [
          {
            component: {
              id: MAP_SCREEN.id,
              name: MAP_SCREEN.settingName,
              options: {
                statusBar: renderStatusBar(true),
                topBar: renderTopTab(MAP_SCREEN), 
                bottomTab: renderBottomTabIcon(MAP_SCREEN)
              },
              passProps: passProp
            }
          }
        ]
      }
    },
    {
      stack: {
        children: [
          {
            component: {
              id: NOTIFICATION_SCREEN.id,
              name: NOTIFICATION_SCREEN.settingName,
              options: {
                statusBar: renderStatusBar(true),
                topBar: renderTopTab(NOTIFICATION_SCREEN), 
                bottomTab: renderBottomTabIcon(NOTIFICATION_SCREEN),
              },
              passProps: passProp
            }
          }
        ]
      }
    },
    {
      stack: {
        children: [
          {
            component: {
              id: OPTION_SCREEN.id,
              name: OPTION_SCREEN.settingName,
              options: {
                statusBar: renderStatusBar(true),
                topBar: renderTopTab(OPTION_SCREEN), 
                bottomTab: renderBottomTabIcon(OPTION_SCREEN)
              },
              passProps: passProp
            },
          }
        ],  
      }
    }
  ],
  options: {
    bottomTabs: {
      currentTabId: TASK_SCREEN.id
    }
  }

})