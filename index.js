/**
 * @format
 */

import { AppRegistry, NativeModules } from 'react-native';
import App from './src/routes';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging'
import { Component } from 'react';
import constans from './src/utils/constants'

const { PrefModule, NotificationModule } = NativeModules

const handleBackground = async (remoteMessage) => {
    let { messageId, messageType, collapseKey, data, to, ttl } = remoteMessage
    
    await PrefModule.load('key', (acc) => {
        if(JSON.stringify(acc).length > 2){
            data.targets.includes(JSON.parse(acc).key)
            ? NotificationModule.show(true, remoteMessage)
            : console.log('Pengguna sudah logout.')
        }else{
            console.log('anda logout')
        }
    })
    
    console.log('background recieved')
    return Promise.resolve()
}

messaging().setBackgroundMessageHandler(handleBackground)
AppRegistry.registerComponent(appName, () => App); //AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', handleBackground)
