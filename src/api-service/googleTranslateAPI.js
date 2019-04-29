const API_key = "AIzaSyDfsSJxZrSSPRlN04lZxx7JxqV-NuotAjQ"
export const requestTextToSpeechAPI = () => `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=` +`${API_key}`
export const requestSpeechToTextAPI = () => `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=` + `${API_key}`