/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import { NativeModules, Text, View, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      loading: false,
      nrp: '',
      telp: '',
      kesatuan: '',
      opJbt: '',
      wilayah: ''
    }
  }

  activatedUsr = () => {
    let 
      {nrp, telp, kesatuan, opJbt, wilayah} = this.state,
      { navigation } = this.props,
      title = navigation.getParam('title'), 
      jabatan = title == constants.menu_op_koramil_2 
        ? 'Babinsa' 
        : title == constants.menu_op_kodim_3
        ? opJbt
        : title == constants.menu_dandim_3
        ? 'Operator Kodim'
        : '',
      level = title == constants.menu_op_koramil_2 
        ? constants.level_babinsa
        : title == constants.menu_op_kodim_3
        ? opJbt == 'Komandan Kodim' ? constants.level_dandim : constants.level_op_koramil
        : title == constants.menu_dandim_3
        ? constants.level_op_kodim
        : 0,
      ref = constants.dbRef('pre_users').doc(),
      key = ref.id,
      telpParsed = constants.formatPhoneNumber(telp),
      user = { key, nrp, telp: telpParsed, wilayah: wilayah ? wilayah : kesatuan.split('/ ')[1], kesatuan, jabatan, level, creationTime: Date.now() }

      
      nrp.length && telp.length && kesatuan.length
      ? this.setState({loading: !this.state.loading}, () => //alert(JSON.stringify(user, null, 2))
        constants.dbRef('pre_users').where('telp', '==', telpParsed).get().then(data => {
          data.empty ? ref.set(user).then(data => { this.props.navigation.pop() && alert(`${telpParsed} berhasil diaktifkan.`) }).catch(err => { alert(`${err}`) })
          : this.setState({loading: !this.state.loading}, () => alert('Maaf anda tidak dapat mendaftarkan nomor yang telah diaktifkan.'))
        }).catch(err => console.log(err)))
      : alert('Maaf, form belum lengkap terisi.')
  }

  render() {
    const 
      { kesatuan, wilayah } = this.state,
      { navigation } = this.props,
      title = navigation.getParam('title'), 
      getJabatan = title == constants.menu_op_koramil_2 
      ? 'Babinsa' 
      : title == constants.menu_op_kodim_3
      ? 'Operator Koramil'
      : title == constants.menu_dandim_3
      ? 'Operator Kodim'
      : '',
      isDandimOrOpKodim = () => { let rsl = false
        if(title == constants.menu_dandim_3 || title == constants.menu_op_kodim_3){
          rsl = true
        }

        return rsl
      },
      navigate = (screen, param) => navigation.navigate(screen, param)

    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.toolbar}>
              <TouchableOpacity activeOpacity={0.5} onPress={()=> navigation.pop()}>
                <Image style={styles.iconbar} source={require("../src/assets/ic_back.png")} resizeMode="contain" />              
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={()=> null}>
                <Image style={styles.iconbar} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <Text style={styles.welcome}>{navigation && title}</Text>
            <constants.separatorApp />
            <View style={{height:45}}></View>
            <TextInput style={styles.inp_tx_normal} placeholder="NRP" keyboardType="phone-pad" onChange={(e) => this.setState({nrp: e.nativeEvent.text})}/>
            <TextInput style={styles.inp_tx_normal} placeholder="No. telp" keyboardType="phone-pad" onChange={(e) => this.setState({telp: e.nativeEvent.text})}/>
            <Text style={styles.inp_tx_normal} onPress={() => {
              constants.SlideListModule.show(constants.loopArray(getJabatan == 'Operator Koramil' ? [getJabatan, 'Komandan Kodim'] : [getJabatan])).then(item => 
                this.setState({opJbt: item}))
            }}>{!this.state.opJbt.length ? 'Pilih Jabatan..' : this.state.opJbt}</Text>
            <Text style={styles.inp_tx_normal} onPress={() => constants.SlideListModule.show(constants.loopArray(
                constants.wilayah.map(val => val.nama).filter((val, idx) => 
                  (this.state.opJbt == 'Komandan Kodim' || getJabatan == 'Operator Kodim') ? idx == 0 : idx > 0
                )
              )).then(item => this.setState({kesatuan: item}))
            }>{!kesatuan.length ? 'Pilih Kesatuan..': kesatuan}</Text>
            { getJabatan == 'Babinsa' &&
              <Text style={styles.inp_tx_normal} onPress={() => 
                constants.SlideListModule.show(constants.loopArray(
                  constants.wilayah.filter(val => val.nama == kesatuan).map(wil => wil.array)
                )).then(item => this.setState({wilayah: item}))
              }>{wilayah.length ? wilayah : 'Wilayah operasi'}</Text>
            }
            <View style={{height:25}}></View>
            <TouchableOpacity disabled={this.state.loading} style={styles.btn_toucher} activeOpacity={0.5} onPress={() => this.activatedUsr()}>
              <Text style={styles.btn_normal}>AKTIFASI PENGGUNA</Text>
            </TouchableOpacity>
            { this.state.loading && constants.progress() }
          </View>
        </View>
      </ScrollView>
    );
  }
}

