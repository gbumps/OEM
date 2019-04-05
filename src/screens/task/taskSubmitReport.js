import React,{ Component } from "react";
import { 
  View, 
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  AsyncStorage,
  StyleSheet,
 } from "react-native";
import { CheckBox  } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome"
import { connect } from "react-redux";
import { Navigation } from "react-native-navigation";
import { uploadImageAPI } from "../../apis/uploadImageAPI";
import { submitReportAPI, getReport } from "../../apis/reportAPI";
import autobind from "class-autobind";
import ImageInstance from "../../elements/imageInstance";
import axios from "axios";
import { 
  CAMERA_SCREEN, 
  TASK_SCREEN, 
  LOADING_SCREEN,
} from "../../constants/screen";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "../../constants/mainSetting";
import { 
  TOKEN, 
  USER, YES, NO, AUTHORIZATION, PLACEHOLDER_DESCRIPTION, TASK_IN_PROGRESS_TEMP_ID, TASK_REPORT_PROBLEM_TEMP, TASK_REPORT_WORK_TEMP, TASK_REPORT_WORK_DESCRIPTION_TEMP, TASK_REPORT_PROBLEM_DESCRIPTION_TEMP, REPORT_PROBLEM, REPORT_TASK, END_TASK, REPORT_PROBLEM_NAME } from "../../constants/common";
import { 
  NOTIFICATION, 
  MAX_FILE_LIMIT, 
  MIN_FILE_LIMIT, 
  UPDATE_TASK_SUCCESS, 
  UPDATE_TASK_FAILED, 
  CONFIRM,
  CONFIRM_SUBMIT_MESSAGE,
  CONFIRM_SUBMIT_REPORT,
  CONFIRM_SUBMIT_PROBLEM
} from "../../constants/alert";

const GREEN = "#00a86a"

const listSuggestDescriptions = [
  "Tôi đã hoàn thành công việc",
  "Tôi có vấn đề này",
  "Khác"
]

class TaskSubmitReport extends Component {
 
 constructor(props) {
   super(props)
   this.state={
     taskId: "",
     imgUris: [], 
     description: "",
     reportType: "",
     taskCheckList: [],
     editable: false,
     reportFunctionsView: "flex"
   }
  //  this._submitReport = this._submitReport.bind(this)
  //  this._handleSubmitReport = this._handleSubmitReport.bind(this)
   autobind(this)        //bind all methods except some component lifecycle
 }
  
 componentDidUpdate(prevProps) { //update 
    if (this.props.imageUriReport !== prevProps.imageUriReport) {
      this.state.imgUris.push(this.props.imageUriReport)
      this.setState({
        imgUris: this.state.imgUris
      })
    }
  }

  async componentWillUnmount() {
    if(this.state.imgUris.length !== 0 && 
       this.state.description.length !== 0)
    await AsyncStorage.setItem(TASK_IN_PROGRESS_TEMP_ID, this.state.taskId.toString())
    switch(this.state.reportType) {
      case REPORT_TASK:
        await AsyncStorage.setItem(TASK_REPORT_WORK_TEMP, this.state.imgUris.toString())
        await AsyncStorage.setItem(TASK_REPORT_WORK_DESCRIPTION_TEMP, this.state.description.toString())
        break 
      case REPORT_PROBLEM:
        await AsyncStorage.setItem(TASK_REPORT_PROBLEM_TEMP, this.state.imgUris.toString())
        await AsyncStorage.setItem(TASK_REPORT_PROBLEM_DESCRIPTION_TEMP, this.state.description.toString())
        break
    }
  }

  async componentWillMount() {
    axios.defaults.headers.common[AUTHORIZATION] =await AsyncStorage.getItem(TOKEN)
    const {reportType, taskId, taskStatus, taskCheckList} = this.props
    const tempWorkReport = await Promise.all([
      AsyncStorage.getItem(TASK_IN_PROGRESS_TEMP_ID),
      AsyncStorage.getItem(TASK_REPORT_WORK_TEMP),
      AsyncStorage.getItem(TASK_REPORT_WORK_DESCRIPTION_TEMP)
    ])
    const tempProblemReport = await Promise.all([
      AsyncStorage.getItem(TASK_IN_PROGRESS_TEMP_ID),
      AsyncStorage.getItem(TASK_REPORT_PROBLEM_TEMP),
      AsyncStorage.getItem(TASK_REPORT_PROBLEM_DESCRIPTION_TEMP)
    ])
    switch (reportType) {
      case REPORT_TASK: 
        if (tempWorkReport[0] == this.props.taskId) {
          this.setState({
            imgUris: tempWorkReport[1].split(","),
            description: tempWorkReport[2]
          })
        }
        break
      case REPORT_PROBLEM:
        if (tempProblemReport[0] == this.props.taskId) {
          this.setState({
            imgUris: tempProblemReport[1].split(","),
            description: tempProblemReport[2]
          })
        }
        break
    }
    this.setState({ 
      reportType: reportType, 
      taskId: taskId,
      taskStatus: taskStatus,
      taskCheckList: taskCheckList
    })
  }
  
  async componentDidMount() {

  }

  _createFormData(uri) { 
      const formData = new FormData();
      formData.append('dataFile', {
        uri: uri,
        type: 'image/jpeg',
        name: 'report' + ".jpg"
      })
      return formData
  }

  async _submitReport() {
    Navigation.showModal({
      component: {
        name: LOADING_SCREEN.settingName,
      }, 
    })
    
    const userId = await AsyncStorage.getItem(USER.ID)
    const imageUrls = await Promise.all(
      this.state.imgUris.map(async (uri) => {
      const link = uploadImageAPI(), 
            formData = this._createFormData(uri)
      const response = await axios({
        url: link,
        method: "POST",
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    }));
    
    const photoString = imageUrls.join("; ")
    const submitLink = submitReportAPI();
    axios({
       url: submitLink,
       method: "POST",
       data: {
        "checkList": (this.state.reportType === 1) ? this.state.taskCheckList : [],
        "dto": {
          "description": this.state.description,
          "employeeId": userId,
          "photo": photoString,
          "taskId": this.state.taskId,
          "type": this.state.reportType
        }
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(async (res) => {
        Navigation.dismissAllModals()
        switch(this.state.reportType) {
          case REPORT_TASK: 
            await AsyncStorage.multiRemove([
              TASK_REPORT_WORK_DESCRIPTION_TEMP,
              TASK_REPORT_WORK_TEMP
            ])
            break;
          case REPORT_PROBLEM: 
            await AsyncStorage.multiRemove([
              TASK_REPORT_PROBLEM_DESCRIPTION_TEMP,
              TASK_REPORT_PROBLEM_TEMP
            ])
            break;
        }
        Alert.alert(NOTIFICATION, UPDATE_TASK_SUCCESS,[],{
          onDismiss: () => Navigation.popToRoot(TASK_SCREEN.id)
        })
    }).catch(err => {
        Navigation.dismissAllModals()
        Alert.alert(NOTIFICATION, UPDATE_TASK_FAILED)
    })
   }

   _handlePressCamera() { 
      if (this.state.imgUris.length === 6) {
        Alert.alert(NOTIFICATION, MAX_FILE_LIMIT)
        return;
      }
      Navigation.showModal({
      component: {
        name: CAMERA_SCREEN.settingName,
        passProps: {
          action: "report"
        }
      }
    })}

   _handleSubmitReport() {
    if (this.state.imgUris.length === 0) {
      Alert.alert(NOTIFICATION, MIN_FILE_LIMIT)
      return;
    }
    else {
      switch (this.state.reportType) {
        case 1: 
        Alert.alert(CONFIRM_SUBMIT_MESSAGE, CONFIRM_SUBMIT_REPORT, [
          {
            text: YES,
            onPress: this._submitReport
          }, 
          {
            text: NO,
            onPress: () => console.log('User Denied')
          }
        ])
        break
        case 2:
        Alert.alert(CONFIRM, CONFIRM_SUBMIT_PROBLEM, [
          {
            text: YES,
            onPress: this._submitReport
          }, 
          {
            text: NO,
            onPress: () => console.log('User Denied')
          }
        ])
        break
        default: 
          console.log("nothing !")
          break
      }
    }
   }
  

  render() {
    return( 
      <View style={styles.container}>
        <TextInput style={styles.textDescription}
          editable= { this.state.editable }
          onChangeText={(text) => {
            this.setState({
              description: text
            })
          }}
          value={this.state.description}
          placeholder={PLACEHOLDER_DESCRIPTION}
        />
        <View> 
          {
            listSuggestDescriptions.map((t,i) => {
              return (
                <CheckBox containerStyle={styles.checkBoxContainer} 
                  title={t}
                  onPress={() => {
                    if (t == listSuggestDescriptions[2]) {
                      this.setState({
                        editable: true,
                        description: "" 
                      })
                    }
                    else {
                      this.setState({
                        editable: false,
                        description: t
                      })
                    }
                  }} 
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o">
                  <Text>{t}</Text>
                </CheckBox>
              )
            })
          }
        </View>
          <Text style={{padding: 15, fontSize: 20}}>Hình ảnh</Text>
          <ScrollView
            horizontal={true}
            style={{ padding: 10 }}> 
            { this.state.imgUris.map((l,index) => (
                <ImageInstance 
                  key={index}
                  index={index}
                  imageList={this.state.imgUris}
                  imageSource={{uri: l}} 
                  displayClose={this.state.reportFunctionsView}
                  onPressYes={() => {
                    this.state.imgUris.splice(index, 1)
                    this.setState({
                      imgUris: this.state.imgUris
                    })
                  }}/>
                )) }
          </ScrollView>
          <View style={[{ display: this.state.reportFunctionsView }, styles.reportFunctionView]}> 
            <View style={styles.cameraBtnComponent}>
            <TouchableOpacity onPress={ this._handlePressCamera }>
              <Icon name="camera" size={30} color="white" />
            </TouchableOpacity>
            </View>
            <View style={styles.endButton}>
              <TouchableOpacity onPress={this._handleSubmitReport}> 
                <Text style={{color: "white", fontSize: 20}}>
                  {this.state.reportType === 1 ? END_TASK : REPORT_PROBLEM_NAME} 
                </Text>
              </TouchableOpacity> 
              </View>
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  reportFunctionView: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
  },
  checkBoxContainer: {
    backgroundColor: 'white',
    borderWidth: 0, 
    padding: 20
  },
  container: {
    width: DEVICE_WIDTH, 
    height: DEVICE_HEIGHT,
    flex: 1
  },           
  endButton: {
    borderRadius: 20,
    margin: 2,
    padding: 10,
    backgroundColor: "#00af63",
    width: DEVICE_WIDTH / 2 + 20,
    justifyContent: "center", 
    alignItems: "center"
  },
  cameraBtnComponent: {
    width: 50,
    height: 50,
    borderRadius: 50/2,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  }, 
  textDescription: {
    marginLeft: 15,
    fontSize: 20
  }
})

const mapStateToProps = ({camera}) => {
  return {
    imageUriReport: camera.imageUriReport
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps)
(TaskSubmitReport);