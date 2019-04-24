import baseURL from "./mainConnection";

export const requestUserInfoURL = (id) => 
  `${baseURL}/employee/get-info` + `?id=${id}`

export const requestAccountByPhoneNumber = (phoneNumber) => 
`${baseURL}/employee/get-info-by-phone-number`+ 
`?phoneNumber=${phoneNumber}`

export const requestUpdateUserInfo = (userId) => 
`${baseURL}/account/update/`+ `${userId}`

export const requestUpdatePassword = () => 
  `${baseURL}/account/change-password`