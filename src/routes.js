import React, { Component } from 'react'
import { View, NativeModules } from 'react-native'
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'

import Login from '../src/login'
import Verify from '../src/verify'
import Main from '../src/main'
import Confirm from '../src/confirm'
import Register from '../src/register'
import Article from '../src/article'
import Report from '../src/report'
import Submit from '../src/submit'
import Snapsend from '../src/snapsend'
import Activateduser from '../src/activateduser'
import Pdfviewer from '../src/pdfviewer'
import SelfUpdate from '../src/selfupdate'
import PhotoUploader from '../src/photoUploader'
import ImagePrevew from '../src/imagePrevew'

const { PrefModule } = NativeModules

class SwitcherPage extends Component{
	constructor(){
		super()
		this.state = {
			isLoggedIn: ''
		}
		this._bootstrapAsync()
	}

	_bootstrapAsync = async () => { 
		await PrefModule.load('key', data => {
			this.props.navigation.navigate('AppScreen')
		})
	}

	render(){
		return null
	}
}

const Auth = {
	LoginScreen: Login,
	VerifyScreen: Verify,
	ConfirmScreen: Confirm,
	RegisterScreen: Register
}

const App = {
	LoginScreen: Login,
	MainScreen: Main,
	SelfUpdateScreen: SelfUpdate,
	ArticleScreen: Article,
	ReportScreen: Report,
	SubmitScreen: Submit,
	SnapsendScreen: Snapsend,
	ActivateduserScreen: Activateduser,
	PhotoUploaderScreen: PhotoUploader,
	ImagePreviewScreen: ImagePrevew,
	PdfviewerScreen: Pdfviewer
}

const config = (initialScreen) => ({
	headerMode: 'none', 
	initialRouteName: initialScreen
})
  
const Root = {
	SwitcherRoot: SwitcherPage,
	AppScreen: createStackNavigator(App, config('MainScreen')),
	AuthScreen: createStackNavigator(Auth, config('LoginScreen'))
}

const RootNavigator = createSwitchNavigator(Root, config('SwitcherRoot'));

export default createAppContainer(RootNavigator);