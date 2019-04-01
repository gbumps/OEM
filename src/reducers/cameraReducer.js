import { SAVE_LINK_IMAGE_REPORT } from "../constants/actionType";

const cameraReducer = (state = {}, action) => {
  switch(action.type) {
    case SAVE_LINK_IMAGE_REPORT: 
      return state = {
        imageUriReport: action.payload
      }
    default:
      return state
  }
} 

export default cameraReducer;