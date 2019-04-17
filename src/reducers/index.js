import { combineReducers  } from "redux";
import cameraReducer from "./cameraReducer";

const rootReducers = combineReducers({
  camera: cameraReducer
})

export default rootReducers