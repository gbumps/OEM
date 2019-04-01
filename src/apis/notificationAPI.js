import baseURL from "./mainConnection";
import { MAXIMUM_NOTIFICATION_UPDATE } from "../constants/common";

export const requestNotificationHistory = (employeeId, page, count) => 
  `${baseURL}/notify/get-all/` + 
  `${employeeId}?page=${page}&size=${count}` 
  
export const updateNotification = (notiId) => 
  `${baseURL}/notify/update/` + 
  `${notiId}`