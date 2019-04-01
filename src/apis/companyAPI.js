import baseURL from "./mainConnection";

export const requestCompanyInfoAPI = (companyId) => 
  `${baseURL}/company/get-company-by-id` + 
  `?companyId=${companyId}` 
  

