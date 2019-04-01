import Login from "./src/screens/login/login";
import Notification from "./src/screens/notification/notification";
import Option from "./src/screens/option/option";
import TaskEmployee from "./src/screens/task/taskEmployee";
import TaskInfo from "./src/screens/task/taskInfo";
import Camera from "./src/screens/camera/camera";
import ImageView from "./src/screens/camera/imageView";
import TaskSubmitReport from "./src/screens/task/taskSubmitReport";
import CompanyInfo from "./src/screens/companyInfo/companyInfo";
import ChangePassword from "./src/screens/changepass/changepass";
import WaitingScreen from "./src/screens/waitingScreen/waitingScreen";
import Maps from "./src/screens/maps/maps.js";
import { Provider } from "react-redux";
import store from "./src/stores/store";
import { registerComponent } from "./src/functions/functions";
import * as screens from "./src/constants/screen";

export function registerScreen() {
  registerComponent(
    screens.LOGIN_SCREEN.settingName,
    Login,
    Provider,
    store
  );
  registerComponent(
    screens.NOTIFICATION_SCREEN.settingName,
    Notification,
    Provider,
    store
  );
  registerComponent(
    screens.TASK_SCREEN.settingName,
    TaskEmployee,
    Provider,
    store
  );
  registerComponent(
    screens.OPTION_SCREEN.settingName,
    Option, 
    Provider,
    store
  );
  registerComponent(
    screens.TASK_INFO_SCREEN.settingName,
    TaskInfo,
    Provider,
    store
  );
  registerComponent(
    screens.CAMERA_SCREEN.settingName,
    Camera,
    Provider,
    store
  );
  registerComponent(
    screens.TASK_REPORT_SCREEN.settingName,
    TaskSubmitReport,
    Provider,
    store
  );
  registerComponent(
    screens.LOADING_SCREEN.settingName,
    WaitingScreen,
    Provider,
    store
  ); 
  registerComponent(
    screens.MAP_SCREEN.settingName,
    Maps,
    Provider, 
    store
  ); 
  registerComponent(
    screens.COMPANY_INFO_SCREEN.settingName,
    CompanyInfo,
    Provider, 
    store
  ); 
  registerComponent(
    screens.CHANGE_PASSWORD_SCREEN.settingName,
    ChangePassword,
    Provider, 
    store
  ); 
  registerComponent(
    screens.IMAGE_SCREEN.settingName,
    ImageView,
    Provider, 
    store
  ); 
}