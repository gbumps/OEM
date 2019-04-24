import baseURL from "./mainConnection";

export const requestTaskByDateURL = (employeeID, date) => 
  `${baseURL}/task/get-task-by-date?assigneeId=` + `${employeeID}` + `&date=` + `${date}`

export const requestTaskDetailURL = (taskId) => 
  `${baseURL}/task/get-task-detail?taskId=` + `${taskId}`

export const requestUpcomingTask = (employeeId, upcomingDate) => 
  `${baseURL}/task/get-upcoming-task/` + `${employeeId}?dateCurrentStr=` + `${upcomingDate}` 

export const requestTodayTaskLocation = (employeeId) => 
  `${baseURL}//task/get-today-locations?assigneeId=` + `${employeeId}`

export const requestCheckAttendanceForTask = (taskId) => 
  `${baseURL}/task/check-attendance?taskId=` + `${taskId}`