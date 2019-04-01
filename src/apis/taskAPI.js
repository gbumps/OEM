import baseURL from "./mainConnection";

export const requestTodayTaskURL = (employeeID) => 
  `${baseURL}/task/get-today-task?assigneeId=` + `${employeeID}`

export const requestTaskDetailURL = (taskId) => 
  `${baseURL}/task/get-task-detail?taskId=` + `${taskId}`

export const requestUpcomingTask = (employeeId) => 
  `${baseURL}/task/get-upcoming-task?assigneeId=` + `${employeeId}`

export const requestTodayTaskLocation = (employeeId) => 
  `${baseURL}//task/get-today-locations?assigneeId=` + `${employeeId}`

export const requestCheckAttendanceForTask = (taskId) => 
  `${baseURL}/task/check-attendance?taskId=` + `${taskId}`