import { SAVE_LINK_IMAGE_REPORT } from "../constants/actionType";

const saveImageReport = (link) =>({
  type: SAVE_LINK_IMAGE_REPORT,
  payload: link
})

// const saveImageProblem = (link) => ({
//   type: SAVE_LINK_IMAGE_PROBLEM,
//   payload: link
// })

export const toggleSave = (link) => { 
  return dispatch => (
     dispatch(saveImageReport(link))
  )
}