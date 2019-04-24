import baseURL from "./mainConnection";

export const requestLoginURL = () => 
  `${baseURL}/account/login`
  
export const requestPhoneNumber = (macAddress) => 
  `${baseURL}/employee/check-phone-mac-address` + 
  `?macAddress=${macAddress}`

