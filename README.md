this project was bootstrapped with react-native `react-native init`

## React native

Open Terminal and run `npm i` or `yarn add`
Run `npm start` for running in development mode
No need to `react-native link` because all frameworks has already been linked.

## For iOS

`cd ios && pod install`, then `cd .. && npm run ios` or open `OEM.xcworkspace` in Xcode

## For Android

Make sure to have an Android Emulator running !
Open Terminal and run `npm run android` or open folder `android` in IntelliJ IDEA or Android Studio

## Screenshot

### 1. Login screen
![alt text](https://i.ibb.co/Cht8ZRN/Screen-Shot-2019-12-22-at-12-36-44-AM.png)

| No | Function | Description | Validation | Outcome |
| --- | --- | --- | --- | --- |
| 4	| Login | Login into system | Required | Transfer to task dashboard |


### 2. Today task dashboard screen
![alt text](https://i.ibb.co/0s3tDZC/Screen-Shot-2019-12-22-at-12-24-10-AM.png)

| No | Function | Description | Validation | Outcome |
| --- | --- | --- | --- | --- |
| 1 | View Upcoming Task | Show all upcoming tasks of employee for the next 7 days | None |	Upcoming Task Dashboard view will be shown |
| 2 | Show/hide Task in Progress | Show/hide all tasks in progress | None | Task in Progress view will be shown/hide |
| 3 | View task detail | View full detail of a task |	None | Transfer to Task detail screen |
| 4	| Show/hide Task Pending Approval |	Show/hide all tasks in pending for approval by manager | None |	Task Pending Approval view will be shown/hide |
| 5	| Show/hide Task Not Start | Show/hide all tasks not yet started | None | Task Not Start view will be shown/hide |
| 6	| Show/hide Task Completed | Show/hide all tasks that marked as completed |	None | Task Completed view will be shown/hide |
| 7	| Show/hide Task Overdue |	Show/hide all tasks that marked as absent or overdue | None | Task Absent/Overdue view will be shown/hide
| 8 | View history task list |	Show all tasks of a specific date |	Only past date to present | A datepicker pop-up will be opened, and tasks with each status will be rendered after date is picked


### 3. Upcoming task dashboard screen
![alt text](https://i.ibb.co/mRhsVKZ/Screen-Shot-2019-12-22-at-12-40-12-AM.png)

| No | Function | Description | Validation | Outcome |
| --- | --- | --- | --- | --- |
| 1 | View Today Task |	View all today tasks of an employee | None | Today Task Dashboard view will be shown |
| 2	| Upcoming task for each date | Show all upcoming tasks of a specified date | None | Tasks will be shown as timeline if having task at the chosen date, otherwise, show “Không có công việc cho ngày này” as figure above. |
| 3	| View task Information | View information of a task | None |	Transfer to Task Detail View |
| 4	| View upcoming task list by date | View upcoming task at a specific date | Only date from tomorrow to future | A datepicker pop-up will be opened, and task will be rendered at timeline, along with the next 7 days on the screen.|

### 4. Task info screen 
![alt text](https://i.ibb.co/c215zwr/Screen-Shot-2019-12-22-at-12-46-07-AM.png)

| No | Function | Description | Validation | Outcome |
| --- | --- | --- | --- | --- |
| 3 |	View task workplace image |	Show/hide task workplace image |	None |	Task workplace picture will be shown/hide |
| 5 |	Show check-in time |	Show/hide check in time |	None |	Check-in time will be shown/hide |
| 7 |	Complete task |	Submit report of the task |	If task status is “IN PROGRESS” only |	Transfer to task report screen |
| 8 |	Report task problem | 	Submit problem of the task | If task status is “IN PROGRESS” only | Transfer to report task problem view | 
| 9 |	Go back | Back to previous screen | None |Transfer to the previous screen |
| 10 |	Show company’s direction |	Show company’s direction on Google maps | 	None |	Transfer to Google Maps app or Google Maps web view with direction from user’s location to company location |
| 13 |	Show description |	Show/hide description |	None |	Description of the task will be shown/hide |

### 5. Task report screen
![alt text](https://i.ibb.co/b1vt2Lt/Screen-Shot-2019-12-22-at-12-50-06-AM.png)

| No | Function | Description | Validation | Outcome |
| --- | --- | --- | --- | --- |
| 2 | 	Pick a sample suggestion |  Let user choose a sample description instead of typing | None |	Report description will change with the content of the chosen description. User can modify the report description by tapping on “Khác” or tapping on the text box.| 
| 3 |	Delete image |	Delete an image | 	None |	A confirm message will appear on screen: “Bạn có muốn xoá hình này”. The image will be deleted after pressing “Có”, otherwise, do nothing. |
| 4 |	View image | View one or more image | 	None |	Transfer to image view |
| 5 |	Submit Report |	Submit Report |	User must take at least one picture | A confirm message will appear on screen: “Bạn có muốn nộp báo cáo ?”. the report will be submitted after press “Có ”, otherwise, do nothing. |
| 6	| Take picture |	Take a picture | User can only take 6 pictures |	Transfer to Camera screen |
| 7 |	Back |	Back to previous page |	None |	Transfer back to Task Detail View |



