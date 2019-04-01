import { LOGOUT_SUCCESS } from "../constants/actionType";

const logoutReducer = async (state = {}, action) => {
  switch(action.type) {
    case LOGOUT_SUCCESS: 
    default:
      return state
  }
} 

export default logoutReducer;