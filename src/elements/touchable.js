import React, { Component } from "react";
import { 
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  View
} from "react-native";

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text: {
    fontFamily: 'Lato-Bold',
    color: 'rgb(66, 134, 244)',
    fontSize: 15
  },
})

export default class TouchableButton extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={this.props.onClick}>
        <View>
          {this.props.leftView}
        </View>
        <Image source={this.props.rightView}/> 
      </TouchableOpacity>
    )
  }
}