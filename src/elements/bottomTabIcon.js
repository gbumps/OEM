export default renderBottomTabIcon = (component) => {
  return {
    title: {
      text: component.vnName
    },
    icon: component.icon,
  }
}