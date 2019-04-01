import RNFirebase from "react-native-firebase";

export default firebase = RNFirebase.initializeApp({
  debug: false,
  promptOnMissingPlayServices: true
})