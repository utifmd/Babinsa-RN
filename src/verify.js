/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Text, View, ScrollView, Image, TouchableOpacity, TextInput} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

import auth from '@react-native-firebase/auth'
import firestore, { firebase } from '@react-native-firebase/firestore'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      isload: false,
      phoneNumber: ''
    }
    this.unsubscriber = null
  } // componentDidMount = () => { //   this.unsubscriber = constants.dbRef('pre_users').onSnapshot() // } // componentWillUnmount = () => { //   this.unsubscriber() // }

  checkPhoneNumber = () => {
    let 
      { phoneNumber, isload } = this.state,
      phoneNumberParsed = constants.formatPhoneNumber(phoneNumber)

    if (phoneNumber.length) {
      this.setState({isload: !isload})
      constants.dbRef('pre_users').where('telp', '==', phoneNumberParsed).get().then(doc => {
        if(!doc.empty){
          doc.forEach(row => {
            this.filterUserExist(phoneNumberParsed, row)
          })
        }else this.setState({isload: false}, () => alert(`Maaf No. Telp anda belum terdaftar pada sistem, silahkan hubungi operator.`))
      }).catch(err => this.setState({isload: false}, () => alert(`${err}`)))
    } else this.setState({isload: false}, () => alert('Maaf form tidak boleh kosong.'))
  }

  filterUserExist = (phoneNumberParsed, row) => {
    constants.dbRef('users').where('telp', '==', phoneNumberParsed).get().then((doc) => { 
      !doc.empty
      ? this.props.navigation.pop() && alert('Maaf, nomor anda sudah digunakan, silahkan hubungi developer.')
      : this.verifyPhone(row.data())
    })
  }

  verifyPhone = (checkedData) => {
    let 
      { phoneNumber, isload } = this.state,
      phoneNumberParsed = constants.formatPhoneNumber(phoneNumber)

    phoneNumber.length
    ? auth()
      .verifyPhoneNumber(phoneNumberParsed)
      .on('state_changed', (phoneAuthSnapshot) => {
        switch (phoneAuthSnapshot.state) {
          case auth.PhoneAuthState.CODE_SENT: console.log('code sent');
            auth().signInWithPhoneNumber(phoneNumberParsed)
              .then(confirmResult => this.props.navigation.navigate('ConfirmScreen', { confirmResult, phoneNumber: phoneNumberParsed, checkedData }))
              .catch(error => this.setState({ message: `Sign In With Phone Number Error: ${error.message}` }));
            break;
          case auth.PhoneAuthState.ERROR: console.log(phoneAuthSnapshot.error);
            break;
          case auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: console.log('auto verify on android timed out');
            break;
          case auth.PhoneAuthState.AUTO_VERIFIED: console.log(phoneAuthSnapshot);
            break;
        }
      }, (error) => { 
        this.setState({isload: false}, () => alert(`${error}`))
      }, (phoneAuthSnapshot) => {
        this.setState({isload: false}, () => console.log(phoneAuthSnapshot))
      })
    : this.setState({isload: false}, () => alert('No. Telp anda tidak boleh kosong.'))
  }
  render() {
    const 
      { navigation } = this.props, //title = navigation.getParam('title'),
      { isload } = this.state,
      navigate = (screen, param) => navigation.navigate(screen, param)
      
    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={{title:'Verifikasi Pengguna', navigation}} />
          <View style={styles.header}>
            <TextInput style={styles.inp_tx_normal} placeholder="No. telp" keyboardType="phone-pad" onChange={(e) => this.setState({phoneNumber: e.nativeEvent.text})}/>
            <View style={{height:25}}></View>
            <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={isload} onPress={() => this.checkPhoneNumber()}>
              <Text style={styles.btn_normal}>KIRIM SMS</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.5} disabled={isload} onPress={()=> this.props.navigation.pop()}>
            <Text style={[styles.page_title, {textAlign: 'center'}]}>Sudah registrasi? klik disini</Text>
          </TouchableOpacity>
          { isload && constants.progress() }
        </View>
      </ScrollView>
    );
  }
}

