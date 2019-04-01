import { 
  baseColor 
} from '../constants/mainSetting';

export default renderTopTab = (component) => ({
    visible: true,
    noBorder: true,
    title: {
      color: baseColor,
      text: component.vnName,
      fontFamily: 'Roboto-Bold',
      fontSize: 28
    },
    backButton: {
      showTitle: false,
      color: baseColor
    }, 
    elevation: 0,
    background: {
      color: 'white',
    }
 })

