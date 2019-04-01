import { Dimensions } from "react-native";

export const baseColor = "rgb(42, 137, 252)";
export const baseFontColor = "white";
export const baseFontFamily = "Lato-Regular";
export const secondaryFontFamily = "Lato-Black";

export const GOOGLE_MAPS_API_KEY = "AIzaSyBzi6k4xf4dNTVRofgFajZKQbApQ_hbzzc"
export const DEVICE_WIDTH = Dimensions.get('window').width;
export const DEVICE_HEIGHT = Dimensions.get('window').height;

// export const configuration = async () => {}
//   headers: {
//     'Authorization': AsyncStorage.getItem(TOKEN) 
//   }
// }
export const ORIENTATION = {
  PORTRAIT: "portrait",
  LANSCAPE: "lanscape"
}