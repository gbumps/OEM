import { 
  FETCH_TODAY_TASK_SUCCESS, 
  FETCH_TODAY_TASK_FAILURE,  
  FETCH_UPCOMING_TASK_FAILURE,
  FETCH_UPCOMING_TASK_SUCCESS
} from "../constants/actionType";

// const initialState = {
//   todayTask: [],
//   upcomingTask: [],
//   taskDetail: {}
// }

const taskReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_TODAY_TASK_SUCCESS: 
      return state = { 
        ...state,
        todayTask: action.payload.data
      }
    case FETCH_TODAY_TASK_FAILURE:
      return state = {
        ...state, 
        todayTask: []
      }
    case FETCH_UPCOMING_TASK_SUCCESS: 
      return state = {
        ...state,
        upcomingTask: action.payload.data
      }
    case FETCH_UPCOMING_TASK_FAILURE: 
      return state = {
        ...state,
        upcomingTask: []
      }
    default: 
      return state
  }
}

export default taskReducer;