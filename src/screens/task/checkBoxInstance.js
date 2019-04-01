import React from "react";
import { 
  View, 
  StyleSheet,
 } from "react-native";

const styles = StyleSheet.create({
  checkBoxContainerStyle: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 0.8,
    borderBottomColor: "#ccc",
    width: 370
  },
  checkBox: {
    borderWidth: 0,
    backgroundColor: "transparent",
    width: 300
  }
})

const CheckBoxInstance = (props) => (
  <View style={styles.checkBoxContainerStyle}>
  <CheckBox
      title={props.title}
      checkedIcon='check-square'
      uncheckedIcon='square'
      checkedColor="green"
      containerStyle={styles.checkBox}
      checked={props.checkState}
      onPress={props.onPress}
  /> 
  <Image source={{uri: props.imageSource}} style={styles.checkBoxImage} />
  </View>
)

export default CheckBoxInstance;