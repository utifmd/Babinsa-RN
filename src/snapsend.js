/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Text, View, ScrollView, Switch, DeviceEventEmitter, TouchableOpacity, TextInput, requireNativeComponent} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      loading: false,
      isImagePlaced: false,
      imgPath: '',
      postMas: null,
      actors: [],
      deviceTokens: [],
      kasus: ['kegiatan', 'kejadian'],
      checkedKasus: 0,
      keterangan: '',
      addressLine: '',
      wilayah: '',
      telp: '',
      photoSource: null,
    }

    this.locationListener = null
    this.submitListener = null
  }

  componentDidMount = () => { 
    this.locationListener = DeviceEventEmitter.addListener('LocationModule', this.onLocationChange)
    this.submitListener = DeviceEventEmitter.addListener('SubmitModule', this.onSubmitAttempted)

  }

  componentWillUnmount = () => {
    this.locationListener.remove()
    this.submitListener.remove()
  }

  onActorsUpdate = () => constants.dbRef('users').onSnapshot((snapshot) => {
    let 
      data = [],
      {wilayah} = this.state

    snapshot.forEach((val, idx) => {
      val.exists
      ? data.push(val.data())
      : console.log('Data tidak ditemukan.')
    })

    if(wilayah.length){
      let actors = data.filter(usr =>  usr.jabatan == 'Babinsa' && usr.wilayah.toLowerCase().includes(wilayah.toLowerCase())),
        deviceTokens = actors.map(x => x.deviceToken)
  
      this.setState({actors, deviceTokens}) //
      console.log(JSON.stringify(actors, null, 2))
    }
  })

  onLocationChange = (val) => {
    let {addressLine, locality, subLocality} = val

    this.setState({
      addressLine: addressLine != null ? addressLine : '', 
      wilayah: subLocality != null ? subLocality : ''}, this.onActorsUpdate)
  }

  onSubmitAttempted = (val) => { console.log('submitListener called.')
    let {photoSource, isUploaded, isImagePlaced} = val

    val && isImagePlaced != null && this.setState({isImagePlaced})
    
    val && photoSource != null && this.setState({photoSource}, this.createPostMas)
  }
  
  submitAllStuff = () => { console.log('button submit called.')
    let { actors, keterangan, wilayah, telp, deviceTokens, addressLine, loading, isImagePlaced, imgPath } = this.state

    keterangan.length && telp.length
    ? isImagePlaced
      ? addressLine.length
        ? deviceTokens.length > 0
          ? this.setState({loading: !loading, imgPath: `post_masyarakat/${telp}_${Date.now()}.png`})
          : alert('Maaf kami gagal menemukan anggota babinsa di lokasi anda saat ini.')
        : alert('Pastikan anda tap box biru hingga lokasi muncul, jika belum aktifkan GPS dipengaturan.')
      : alert('Pastikan mengambil gambar untuk kami tindak lanjuti.')
    : alert('Maaf, form yang anda isi belum lengkap.')
  }

  createPostMas = () => { console.log('createPostMas called.')
    let 
      { actors, keterangan, wilayah, telp, addressLine, photoSource, deviceTokens, imgPath, loading, isImagePlaced, kasus, checkedKasus } = this.state,
      targets = actors.map(x => x.key),
      creationTime = Date.now();
      dbComDoc = constants.dbRef('post_masyarakat').doc(),
      dbNotDoc = constants.dbRef('notifications').doc(),
      keyPstMas = dbComDoc.id,
      keyNot = dbNotDoc.id,
      by = {key: 'Masyarakat', telp: constants.formatPhoneNumber(telp), kesatuan: 'Masyarakat', keyNtf: keyNot},
      postMas = {
        key: keyPstMas, 
        kasus: kasus[checkedKasus],
        captions: keterangan,
        photoSource: {url: photoSource, path: imgPath}, 
        by, 
        targets: targets,
        addressLine, 
        wilayah, 
        creationTime
      },
      notifications = {
        key: keyNot,
        wilayah,
        by,
        targets: targets,
        kasus: kasus[checkedKasus],
        relatedDoc: {title:'post_masyarakat', key:keyPstMas},
        read: false,
        creationTime
      },
      task = [dbComDoc, dbNotDoc],
      taskTitle = [postMas, notifications],
      headsUpParams = {
        registration_ids: deviceTokens.flat(),
        topic: '/topics/news',
        priority: 10,
        data: {
          title: `${kasus[checkedKasus]} di ${wilayah} oleh ${constants.formatPhoneNumber(telp)}`, 
          body: keterangan,
          image: photoSource,
          targets: targets
        }
      }

    try {
      this.scrollView.scrollToEnd({animated: true})
      postMas != null && notifications != null
      ? task.map((db, key) => {
          db.set(taskTitle[key]).then(() => { console.log('snapsend: '+`${taskTitle[key]} done.`)
            this.props.navigation.pop() && alert('Berhasil, terimakasih atas partisipasi anda informasi ini sedang kami ditanggapi.')
          }).catch(err => console.log('snapsend: '+err))
        }) && constants.sendMessage(headsUpParams)
      : alert('Maaf, terjadi kesalahan sistem.')
    } catch (error) {
      alert(error)
    }
  }

  render() {
    const 
      { loading, kasus, checkedKasus, photoSource, imgPath, wilayah } = this.state,
      selectionOpt = (key) => key == checkedKasus && {borderWidth:2, borderColor:  constants.clr_btn_bg_root},
      { navigation } = this.props 

    //console.log(wilayah)
    return (
      <ScrollView ref={(ref) => this.scrollView = ref} style={{flex:1, backgroundColor: constants.clr_bg_root}}>
        <constants.Header mProps={this.props} />
        <constants.SubmitModule style={styles.article_header} upload={imgPath} />
        <constants.LocationModule style={[styles.map_box, {margin: 15}]} />
        <View style={styles.header}>
          <View style={{flex:1, flexDirection: 'row', alignSelf: 'stretch'}}>
          {
            kasus.map((data, key) => 
            <TouchableOpacity key={key} activeOpacity={0.7} style={[styles.inp_tx_normal, {flex: 0.5, alignItems:'center', margin:3}, selectionOpt(key)]} onPress={() => this.setState({checkedKasus: key}) }>
                <Text style={{color: key === checkedKasus ? constants.clr : 'white'}}>{data.toUpperCase()}</Text>
            </TouchableOpacity>
            )
          }
          </View>
          <TextInput style={[styles.inp_tx_normal, {marginBottom: 10}]} placeholder="Keterangan" keyboardType="default" textContentType="fullStreetAddress" onChange={(event) => 
            this.setState({keterangan: event.nativeEvent.text})
          }/>
          <TextInput style={[styles.inp_tx_normal, {marginBottom: 10}]} placeholder="No. telp" keyboardType="phone-pad" onChange={(event) => 
            this.setState({telp: event.nativeEvent.text})
          }/>
          <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={loading} onPress={this.submitAllStuff}>
            <Text style={styles.btn_normal}>Kirim</Text>
          </TouchableOpacity>
          { loading && constants.progress() }
        </View>
      </ScrollView>
    );
  }
}