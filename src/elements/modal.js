import React, { Component  } from "react";
import { 
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from "react-native";

class MyConfigModal extends Component {
  
  constructor(props) {
    super(props)
  }
  
  render() {
    return (
      <Modal 
        animationType={"slide"}
        transparent
        hardwareAccelerated
        supportedOrientation={['portrait']}
        onRequestClose={this.props.cancel}
        visible={this.props.visible}>
        <TouchableWithoutFeedback 
          onPress={this.props.cancel}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? 'padding': ''}>
            <TouchableWithoutFeedback>
              {this.props.main}
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }
}

export default MyConfigModal
