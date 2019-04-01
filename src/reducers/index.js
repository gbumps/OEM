import { combineReducers  } from "redux";
import taskReducer from "./taskReducer"
import logoutReducer from "./logoutReducer";
import cameraReducer from "./cameraReducer";

const rootReducers = combineReducers({
  logout: logoutReducer,
  task: taskReducer,
  camera: cameraReducer
})

export default rootReducers