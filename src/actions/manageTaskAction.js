import { 
  FETCH_TODAY_TASK_SUCCESS,
  FETCH_TODAY_TASK_FAILURE,
  FETCH_TASK_DETAIL_SUCCESS,
  FETCH_UPCOMING_TASK_SUCCESS,
  FETCH_UPCOMING_TASK_FAILURE,
 } from "../constants/actionType";
import { 
  requestTodayTaskURL, 
  requestTaskDetailURL, 
  requestUpcomingTask 
} from "../apis/taskAPI";
import { AsyncStorage } from "react-native"
import axios from "axios";
import { TOKEN } from "../constants/common";


const fetchTaskSuccess = (tasks) => ({
  type: FETCH_TODAY_TASK_SUCCESS,
  payload: tasks 
})

const fetchTaskFailure = (err) => ({
  type: FETCH_TODAY_TASK_FAILURE,
  payload: err 
})

const fetchTaskDetailSuccess = (task) =>({
  type: FETCH_TASK_DETAIL_SUCCESS,
  payload: task
})

const fetchUpcomingTaskSuccess = (task) =>({
  type: FETCH_UPCOMING_TASK_SUCCESS,
  payload: task
})

const fetchUpcomingTaskFailure = (err) =>({
  type: FETCH_UPCOMING_TASK_FAILURE,
  payload: err
})

export const fetchTodayTask = (employeeId) => { 
  const link = requestTodayTaskURL(employeeId)
  return async (dispatch) => (
    axios.get(link,
      {

      },
      {
        headers: {
          'Content-Type': "application/json",
          'Authorization': await AsyncStorage.getItem(TOKEN) 
        } 
      }
    )
     .then(res => {
        dispatch(fetchTaskSuccess(res))
     })
     .catch(err => {
        dispatch(fetchTaskFailure(err))
     })
  )
}

// export const fetchTaskDetail = (taskId) => {
//   const link = requestTaskDetailURL(taskId)
//   return dispatch => {
//     axios.get(link,
//       {
//         headers: {
//           'Authorization': AsyncStorage.getItem(TOKEN) 
//         }
//       }
//     )
//     .then(res => {
//       dispatch(fetchTaskDetailSuccess(res))
//     })
//     .catch(err => {
//       dispatch(fetchTaskDetailFailure(err))
//     })
//   }
// }

export const fetchUpcomingTask = (employeeId) => {
  const link = requestUpcomingTask(employeeId)
  return async dispatch => (
    axios.get(link,
      {},
      {
        headers: {
          'Content-Type': "application/json",
          'Authorization': await AsyncStorage.getItem(TOKEN) 
        } 
      }
    )
     .then(res => {
        dispatch(fetchUpcomingTaskSuccess(res))
     })
     .catch(err => {
        dispatch(fetchUpcomingTaskFailure(err))
     })
  )
}