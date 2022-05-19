/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Text, View, ScrollView, Image, TouchableOpacity, TextInput} from 'react-native'
import styles from '../src/design/styles'
import * as constants from '../src/utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      isload: false,
      deviceToken: '',
      telp: '',
      pwd: ''
    }
    this.textRePwd = this.textRePwd.bind(this)
  }

  componentDidMount = () => {}
  
  componentWillUnmount = () => {}

  navigate = (screen, param) => this.props.navigation.navigate(screen, param)

  phoneNumber = () => this.props.navigation.getParam('phoneNumber')

  textRePwd = () => this.props.navigation.getParam('textRePwd')
  
  stating = (key, val, promise) => {
    this.setState({[key]: val}, promise)
  }

  requireSign = () => {
    const 
      {pwd, telp, isload, deviceToken} = this.state,
      isTelp = this.phoneNumber() ? this.phoneNumber() : telp,
      isPwd = this.textRePwd() ? this.textRePwd() : pwd,
      ref = constants.dbRef('users')

    this.stating('isload', !isload)
    isTelp.length && isPwd.length
    ? ref.where('telp', '==', constants.formatPhoneNumber(isTelp)).get().then(doc => {
        !doc.empty ? doc.forEach((acc, idx) => {
          let { pwd } = acc.data()

          if(pwd == isPwd){
            try {
              constants.updateToken(acc.data(), deviceToken).then(account => { //console.log(JSON.stringify(account, null, 2))
                  constants.PrefModule.apply('key', JSON.stringify(account))
                  this.navigate('MainScreen', {isPassingData: true})
                }).catch(err => alert('Maaf kesalahan pada system token.')) //
            } catch (error) {
              this.stating('isload', false, () => alert(error))
            }
          }else this.stating('isload', false, () => alert('Password anda salah, silahkan ulangi.'))
        })
        : this.stating('isload', false, () => alert('Maaf kami tidak menemukan akun anda pada system.'))
      }).catch(err => {
        this.stating('isload', false, () => alert(err))
      })
    : this.stating('isload', false, () => alert('Maaf, form tidak boleh kosong.'))
  }

  render() {
    const 
      { navigation } = this.props,
      { isload } = this.state

    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={{title: 'Login Pengguna', navigation, isHideBackButton: false}} />
          <View style={styles.header}>
            <TextInput name="telp" type="text" style={styles.inp_tx_normal} placeholder="No. telp" keyboardType="phone-pad" 
              defaultValue={this.phoneNumber() ? this.phoneNumber() : null}
              onChange={(e) => this.stating('telp', e.nativeEvent.text)}/>
            <TextInput style={styles.inp_tx_normal} placeholder="Password" keyboardType="default" secureTextEntry 
              defaultValue={this.textRePwd() ? this.textRePwd() : null} 
              onChange={(e) => this.stating('pwd', e.nativeEvent.text)}/>
            <View style={{height:25}}></View>
            <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={isload} onPress={() => 
              constants.currentToken().then(deviceToken => this.setState({deviceToken}, this.requireSign)).catch(err => console.log(err)) //() => this.requireSign()
            }>
              <Text style={styles.btn_normal}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.5} disabled={isload} onPress={()=> this.navigate('VerifyScreen')}>
            <Text style={[styles.page_title, {textAlign: 'center'}]}>Belum registrasi? klik disini</Text>
          </TouchableOpacity>
          { isload && constants.progress() }
        </View>
      </ScrollView>
    );
  }
}

