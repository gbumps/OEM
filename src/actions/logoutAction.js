import { LOGOUT_SUCCESS } from "../constants/actionType";

const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS
})

export const requestLogout = () => {
  return dispatch => {
    dispatch(logoutSuccess())
  }
}