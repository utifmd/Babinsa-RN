/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
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
      textPwd: '',
      textRePwd: '',
      deviceToken: ''
    }
  }
  componentDidMount = () => {
    this.backHandler = constants.backHandlerHome(this.props)

    constants.currentToken().then(val => this.setState({deviceToken: val}, () => console.log(val))).catch(err => console.log(err))
  }

  componentWillUnmount = () => {
    this.backHandler.remove()
  }

  requireSign = () => {
    const 
      { textFullName, textPwd, textRePwd } = this.state,
      { navigation } = this.props,
      navigate = (screen, param) => navigation.navigate(screen, param),
      user = navigation.getParam('user'),
      checkedData = navigation.getParam('checkedData'),
      { uid, phoneNumber, metadata } = user && user
    
    this.setState({isload: !this.state.isload})
    textFullName.length && textPwd.length && textRePwd.length && phoneNumber.length
    ? textPwd.length >= 6
      ? textPwd == textRePwd
        ? this.createNewUser(textFullName, textRePwd, phoneNumber, metadata, checkedData)
        : this.setState({isload: false}, () => alert('Maaf password yang anda gunakan tidak cocok.'))
      : this.setState({isload: false}, () =>  alert('Maaf password yang anda gunakan minimal 6 karakter.'))
    : this.setState({isload: false}, () =>  alert('Maaf silahkan anda lengkapi form yang diminta.'))
  }

  isAdmin = (userlevel) => {
    let result = false
    if(userlevel === constants.level_op_koramil || userlevel === constants.level_op_kodim ){
      result = true
    }
    return result
  }

  createNewUser = (textFullName, textRePwd, phoneNumber, metadata, checkedData) => {
    const 
      { isload, deviceToken } = this.state,
      { navigation } = this.props,
      { creationTime, lastSignInTime } = metadata,
      navigate = (screen, param) => navigation.navigate(screen, param),
      ref = constants.dbRef('users'),
      getOffice = constants.dbRef('office').where('nama', '==', 'Koramil 01/ Padang panjang').get(),
      refDoc = ref.doc(),
      user = {
        nrp: checkedData.nrp,
        name: textFullName,
        telp: phoneNumber,
        pwd: textRePwd,
        jabatan: checkedData.jabatan,
        kesatuan: checkedData.kesatuan,
        key: refDoc.id,
        level: checkedData.level,
        wilayah: checkedData.wilayah,
        deviceToken: [deviceToken],
        creationTime,
        lastSignInTime
      }

    ref.where('telp', '==', phoneNumber).get().then(doc => {
      if(doc.empty){
        try {
          this.isAdmin(checkedData.level) && 
            constants.dbRef('office').where('nama', '==', checkedData.kesatuan).get().then(snapshot => snapshot.forEach(snapDoc => 
              snapDoc.ref.set({admin: {name: textFullName, telp: checkedData.telp, key: refDoc.id}}, {merge: false})
            ))
          
          refDoc.set(user).then(() => { navigate('LoginScreen', { phoneNumber, textRePwd }) }).catch(err => { this.setState({isload: false}, () => alert(err))}) 
        } catch (error) {
          console.log(error)
        }
      }else{
        this.setState({isload: false}, () =>
          Alert.alert('Warning', 'Akun lama anda masih aktif silahkan hubungi operator dan lakukan login', [{text:'Ok', onPress:() => {
            constants.signOut()
            navigate('LoginScreen', { phoneNumber })
          }}])
        )
      }
    })
  }


  render() {
    const 
      { isload } = this.state,
      { navigation } = this.props,
      navigate = (screen, param) => navigation.navigate(screen, param),
      user = navigation.getParam('user'),
      checkedData = navigation.getParam('checkedData'),
      { uid, phoneNumber, metadata } = user && user,
      { creationTime, lastSignInTime } = metadata //user && alert(JSON.stringify(user, null, 2)) 
      
    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={{title: 'Registrasi Baru', navigation, isHideBackButton: true}} />
          <View style={styles.header}>
            <View style={{flexDirection:'row', marginBottom: 25}}>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.page_title}>NRP</Text>
                <Text style={styles.page_title}>No. telp</Text>
                <Text style={styles.page_title}>Jabatan</Text>
                <Text style={styles.page_title}>Kesatuan</Text>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.page_title}> : {checkedData && checkedData.nrp}</Text>
                <Text style={styles.page_title}> : {checkedData && checkedData.telp}</Text>
                <Text style={styles.page_title}> : {checkedData && checkedData.jabatan}</Text>
                <Text style={styles.page_title}> : {checkedData && checkedData.kesatuan}</Text>
              </View>
            </View>
            <TextInput style={styles.inp_tx_normal} placeholder="Nama lengkap" onChange={(e) => this.setState({textFullName: e.nativeEvent.text})}/>
            <TextInput style={styles.inp_tx_normal} placeholder="Password baru" secureTextEntry onChange={(e) => this.setState({textPwd: e.nativeEvent.text})}/>
            <TextInput style={styles.inp_tx_normal} placeholder="Konfirmasi Password" secureTextEntry onChange={(e) => this.setState({textRePwd: e.nativeEvent.text})}/>
            <View style={{height:25}}></View>
            <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={isload} onPress={() => this.requireSign()}>
              <Text style={styles.btn_normal}>MENDAFTAR</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.5} disabled={isload} onPress={()=> navigate('LoginScreen')}>
            <Text style={[styles.page_title, {textAlign: 'center', marginBottom:20}]}>Batalkan registrasi? klik disini</Text>
          </TouchableOpacity>
          {isload && constants.progress()}
        </View>
      </ScrollView>
    );
  }
}

