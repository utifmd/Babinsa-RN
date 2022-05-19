/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Alert, BackHandler, Text, View, ScrollView, Image, TouchableOpacity, TextInput} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'
import auth from '@react-native-firebase/auth'
import firestore, { firebase } from '@react-native-firebase/firestore'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      isload: false,
      codeInput: ''
    }
  }
  componentDidMount = () => {
    this.backHandler = constants.backHandlerHome(this.props)
  }

  componentWillUnmount = () => {
    this.backHandler.remove()
  }

  stating = (key, val, callback) => {
    this.setState({[key]: val}, () => callback)
  }

  confirmCode = () => {
    const 
      { codeInput, isload } = this.state,
      { navigation } = this.props,
      navigate = (screen, param) => navigation.navigate(screen, param),
      phoneNumber = navigation.getParam('phoneNumber'),
      checkedData = navigation.getParam('checkedData'),
      confirmResult = navigation.getParam('confirmResult')

    this.setState({isload: !isload})//this.stating(isload, !isload)
    if (confirmResult && codeInput.length) {
      confirmResult.confirm(codeInput)
        .then((user) => {
          navigate('RegisterScreen', { user, checkedData }) //this.setState({ message: 'Code Confirmed!' });
        })
        .catch(error => this.setState({isload: false}, () => alert(`Maaf kode verifikasi anda tidak sesuai silahkan cek kembali pada nomor ini: ${phoneNumber}`)));
    }else this.stating('isload', false, alert('Maaf, Form tidak boleh kosong.'))
  };

  render() {
    const 
      { navigation } = this.props,
      { isload } = this.state,
      phoneNumber = navigation.getParam('phoneNumber'),
      confirmResult = navigation.getParam('confirmResult'),
      navigate = (screen, param) => navigation.navigate(screen, param)
      
    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={{title:'Konfirmasi Pengguna', navigation, isHideBackButton: true}} />
          <View style={styles.header}>
            <TextInput style={styles.inp_tx_normal} placeholder={`Kode verifikasi di ${phoneNumber}`} keyboardType="default" onChange={(e) => this.setState({codeInput: e.nativeEvent.text})}/>
            <View style={{height:25}}></View>
            <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={isload} onPress={() => this.confirmCode()}>
              <Text style={styles.btn_normal}>BERIKUTNYA</Text>
            </TouchableOpacity>
            {isload && constants.progress()}
          </View>
        </View>
      </ScrollView>
    );
  }
}

