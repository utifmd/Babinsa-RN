/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * Ahmad dhani +623071111111 123456
 * Ari lasso 081234567890 123456
 * Utif milkedori 0895357037744
 * @format
 * @flow
 */

import React, {Component} from 'react'
import { Platform, Alert, Text, View, ScrollView, Image, TouchableOpacity, TextInput} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      isload: false,
      textFullName: '',
      textTelp: '',
      textPwd: '',
      textRePwd: '',
      brandNew: null,
      isShowFormKoramil: false,
      isShowFormPwd: false
    }
  }

  nav = () => this.props.navigation

  currentUser = () => this.nav().getParam('state')

  onUpdateData = () => {
    let {isload, textFullName, textTelp, textPwd, textRePwd, isShowFormPwd} = this.state,
      brandNew = {
        name: textFullName.length ? textFullName : this.currentUser().name,
        telp: textTelp.length ? textTelp : this.currentUser().telp,
        pwd: textPwd.length ? textPwd : this.currentUser().pwd,
      }

    isShowFormPwd
    ? textRePwd == textPwd
      ? this.setState({isload: !this.state.isload, brandNew}, this.onProccesUpd)
      : alert('Kombinasi password tidak sesuai.')
    : isShowFormKoramil
      ? this.setState({isload: !this.state.isload, brandNew}, () => this.onProccesUpd() && this.onChangeOfficePhoto())
    : this.setState({isload: !this.state.isload, brandNew}, this.onProccesUpd)
  }

  onUpdateState = () => {
    let {brandNew} = this.state,
      dataNew = { ...this.currentUser(), name: brandNew.name, telp: brandNew.telp, pwd: brandNew.pwd }
    
    try {
      constants.PrefModule.apply('key', JSON.stringify(dataNew))
      this.nav().navigate('MainScreen', {isPassingData: true})
    } catch (error) {
      console.log(error)
    }
  }

  onProccesUpd = () => {
    try {
      constants.dbRef('pre_users').where('telp', '==', this.currentUser().telp).get().then(phone => {
        !phone.empty &&
          phone.forEach(val => val.ref.update({telp: this.state.brandNew.telp}))
      }).catch(err => console.log(err))
      constants.dbRef('users').doc(this.currentUser().key)
        .update(this.state.brandNew)
        .then(this.onUpdateState)
        .catch(err => console.log(err))
    } catch (error) {
      console.log(error)
    }
  }

  onChangeOfficePhoto = () => {
    constants.dbRef('office').where('admin.key', '==', this.currentUser().key).get().then(snapshot => {
      if(!snapshot.empty){
        snapshot.forEach((val, idx) => {
          val.ref.update({photoSource: 'http://www.image.com/3.png'})
        })
      }else{
        console.log('akun ini tidak previlage')
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  isFormChange = () => { let result = false, {textFullName, textTelp, textPwd, textRePwd} = this.state
    if((textFullName.length || textTelp.length || textPwd.length || textRePwd.length)){
      result = true
    }
    return result
  }

  render() {
    let {isload, isShowFormPwd, textFullName, textTelp, textPwd, textRePwd} = this.state
      
    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={{title: 'Edit Profile', navigation: this.nav(), isHideBackButton: false}} />
          <View style={styles.header}>
            <View style={{flexDirection: 'row', marginBottom: 25}}>
              <View style={{flexDirection: 'column'}}>
                <Text onPress={this.onChangeOfficePhoto} style={styles.page_title}>NRP</Text>
                <Text style={styles.page_title}>Jabatan</Text>
                <Text style={styles.page_title}>Kesatuan</Text>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.page_title}> : {this.currentUser().nrp}</Text>
                <Text style={styles.page_title}> : {this.currentUser().jabatan}</Text>
                <Text style={styles.page_title}> : {this.currentUser().kesatuan}</Text>
              </View>
            </View>
            <TextInput style={styles.inp_tx_normal} placeholder="Nama lengkap" onChange={(e) => this.setState({textFullName: e.nativeEvent.text})} defaultValue={this.currentUser().name}/>
            <TextInput style={styles.inp_tx_normal} placeholder="No. Telp" onChange={(e) => this.setState({textTelp: e.nativeEvent.text})} defaultValue={this.currentUser().telp}/>
          {
            isShowFormPwd &&
          <View style={{alignSelf: 'stretch'}}>
            <TextInput style={styles.inp_tx_normal} placeholder="Password baru" secureTextEntry onChange={(e) => this.setState({textPwd: e.nativeEvent.text})} />
            <TextInput style={styles.inp_tx_normal} placeholder="Konfirmasi Password" secureTextEntry onChange={(e) => this.setState({textRePwd: e.nativeEvent.text})}/>
          </View>
          }
            <Text style={[styles.page_title, {textAlign: 'center'}]} onPress={() => this.setState({isShowFormPwd: !isShowFormPwd})}>{!isShowFormPwd ? 'Ganti password baru?' : 'Batal ganti password.'}</Text>
            <View style={{height:25}}></View>
            <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={!this.isFormChange()} onPress={this.onUpdateData}>
              <Text style={styles.btn_normal}>PERBARUI</Text>
            </TouchableOpacity>
          </View>
          {isload && constants.progress()}
        </View>
      </ScrollView>
    );
  }
}

