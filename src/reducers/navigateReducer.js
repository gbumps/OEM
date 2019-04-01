import { NAVIGATE_SUCCESS } from "../constants/actionType";

const navigateReducer = (state = {}, action) => {
  switch (action.type) {
    case NAVIGATE_SUCCESS: 
    default:
      return state
  }
}

export default navigateReducer;