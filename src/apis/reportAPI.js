import baseURL from "./mainConnection";

export const submitReportAPI = () => 
  `${baseURL}/report/submit-report`

export const getReport = (taskId) => 
  `${baseURL}/report/get-report/` + `${taskId}`