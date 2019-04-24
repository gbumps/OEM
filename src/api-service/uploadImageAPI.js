import baseURL from "./mainConnection";


export const uploadImageAPI = () => 
  `${baseURL}/upload/handler-upload?pathPackage=` + `image/report/`