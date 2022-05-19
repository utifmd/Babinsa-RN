/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Alert, Text, View, ScrollView, Image, BackHandler, TouchableOpacity, TextInput, DeviceEventEmitter} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'
import Main from './main'
import { firebase } from '@react-native-firebase/auth'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      loading: false,
      isImagePlaced: false,
      imgPath: '',
      photoSource: '',
      actors: [],
      deviceTokens: [],
      posts: null,
      kasus: ['kegiatan', 'kejadian'],
      checkedKasus: 0,
      isKasusPanen: false,
      opening: '', 
      yth: '', 
      locality: '', 
      subLocality: '',
      addressLine: '',
      kecamatan: '',
      nagari: '',
      korban: '',
      kerusakan: '',
      jorong: '',
      poktan: '',
      ketuaPoktan: '',
      pemilikLahan: '',
      luas: '',
      varitas: '',
      kasusName: '',
      captions: '',
      bantuan: ''
    }
  }

  
  nav = () => this.props.navigation
  
  currentUsr = () => this.nav().getParam('user')
  
  currentItms = () => this.nav().getParam('items') != null ? this.nav().getParam('items') : null

  componentDidMount = () => {
    this.submitListener = DeviceEventEmitter.addListener('SubmitModule', this.onSubmitAttempted)
    this.locationListener = DeviceEventEmitter.addListener('LocationModule', this.onLocationListener)
    this.backListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackPressed)

    this.currentItms().kasus != null && this.currentItms().kasus == 'kegiatan'
    ? this.setState({checkedKasus: 0})
    : this.setState({checkedKasus: 1})
  }

  componentWillUnmount = () => {
    this.submitListener.remove()
    this.backListener.remove()
    this.locationListener.remove()
  }

  onSubmitAttempted = (val) => { console.log('onSubmitAttempted called.')
    let {photoSource, isUploaded, isImagePlaced} = val

    val && isImagePlaced != null && this.setState({isImagePlaced})
    
    val && photoSource != null && this.setState({photoSource}, this.onCreatePost)
  }

  onLocationListener = (val) => {
    let {locality, subLocality, addressLine} = val

    val != null && 
      this.setState({locality, subLocality, addressLine}, this.onActorsUpdate)
  }

  onActorsUpdate = () => {
    constants.dbRef('users').where('jabatan', '==', 'Operator Koramil')
      .where('kesatuan', '==', this.currentUsr().kesatuan).get().then((usr) => {
      let actors = []
      !usr.empty
       ? usr.forEach(xUsr => actors.push(xUsr.data()))
       : console.log(`admin ${this.currentUsr().kesatuan} not exists.`)
   
       let actorsKey = actors.map(x => x.key),
        deviceTokens = actors.map(x => x.deviceToken)

       this.setState({actors: actorsKey, deviceTokens}) // console.log(JSON.stringify(deviceTokens, null, 2))
    })
  }

  handleBackPressed = () => {
    let {loading} = this.state, active = false
    
    if(loading){
      active = true
      Alert.alert('Batal', 'Anda yakin membatalkan proses ini?', [{text: 'Ya', onPress: () => this.nav().pop()}], {cancelable: true})
    }

    return active
  }

  onFormAttampted = () => {
    let { loading, kasus, checkedKasus, isKasusPanen, yth, actors, kasusName, captions, photoSource, isImagePlaced, locality, subLocality, addressLine, kecamatan, nagari, korban, kerusakan, jorong, poktan, ketuaPoktan, pemilikLahan, luas, varitas, bantuan} = this.state,
      dtDefault = {
        kasusName: isKasusPanen ? 'Pendampingan panen' : kasusName,
        kasus: checkedKasus == 0 ? kasus[0] : kasus[1],
        kecamatan: kecamatan.length ? kecamatan : locality,
        nagari: nagari.length ? nagari : subLocality,
        bantuan: bantuan,
        expired: false,
        opening: constants.openingBy(this.currentUsr().kesatuan).map(x => x.values[0])[0], // yth.includes('Dandramil') ? constants.openingBy.filter(x => x.values.includes('Dandramil')) : yth.includes('Dandim') ? constants.openingBy.filter(x => x.values.includes('Dandim')) : yth.includes('Dandrem') ? constants.openingBy.filter(x => x.values.includes('Dandrem')) : '',
        captions: captions.length ? captions : this.currentItms().captions != null ? this.currentItms().captions : '',
        creationTime: Date.now()
      },
      babinsaDir = `post_babinsa/${this.currentUsr().key}_${Date.now()}.png`

    actors.length > 0 // <~ admin koramil not exists
    ? isImagePlaced
      ? checkedKasus == 0 // <~ kegiatan true
        ? isKasusPanen
          ? jorong.length && poktan.length && ketuaPoktan.length && pemilikLahan.length && luas.length && varitas.length && bantuan.length // <~ kegiatan (default)
            ? this.setState({loading: !loading, imgPath: babinsaDir, posts: {...dtDefault, ...{type: 'kegiatan/panen', jorong, poktan, ketuaPoktan, pemilikLahan, luas, varitas}}}, () => 
                this.currentItms().photoSource?.url.length ? this.onCreatePost() : null // <~ is forward message from citizen
              )
            : alert('Form pendampingan panen belum lengkap.')
          : jorong.length && bantuan.length // <~ kegiatan
            ? this.setState({loading: !loading, imgPath: babinsaDir, posts: {...dtDefault, ...{type: 'kegiatan/umum', jorong}}}, () => 
                this.currentItms().photoSource?.url.length ? this.onCreatePost() : null
              )
            : alert('Form kegiatan belum lengkap.')
        : kerusakan.length && korban.length && bantuan.length // <~ kejadian ture
          ? this.setState({loading: !loading, imgPath: babinsaDir, posts: {...dtDefault, ...{type: 'kejadian/umum', kerusakan, korban}}}, () => 
              this.currentItms().photoSource?.url.length ? this.onCreatePost() : null
            )
          : alert('Form kejadian belum lengkap.')
      : alert('Anda wajib menyertakan gambar untuk bukti laporan.')
    : alert(`Pastikan anda menghidupkan GPS dan ketuk box biru untuk mendapatkan lokasi.`)
  }

  onCreatePost = () => {
    let { loading, kasus, checkedKasus, deviceTokens, captions, imgPath, isKasusPanen, posts, actors, photoSource, isImagePlaced, locality, subLocality, addressLine, kecamatan, nagari, korban, kerusakan, jorong, poktan, ketuaPoktan, pemilikLahan, luas, varitas, bantuan} = this.state,
      babinsa = constants.dbRef('post_babinsa').doc(),
      notif = constants.dbRef('notifications').doc(),
      postId = babinsa.id,
      by = {key: this.currentUsr().key, keyNtf: notif.id, telp: this.currentUsr().telp, kesatuan: this.currentUsr().kesatuan, name: this.currentUsr().name},
      creationTime = Date.now(),
      dataBab = {
        key: postId, 
        kasus: kasus[checkedKasus],
        posts,
        photoSource: {url: photoSource, path: imgPath}, 
        by, 
        targets: actors,
        addressLine, 
        wilayah: subLocality, 
        creationTime
      },
      dataNotif = {
        key: notif.id,
        kasus: kasus[checkedKasus],
        relatedDoc: {title:'post_babinsa', key:postId},
        photoSource,
        by, 
        targets: actors,
        read: false,
        wilayah: this.currentUsr().wilayah, 
        creationTime: Date.now()
      },
      taskTitle = [dataBab, dataNotif],
      tasks = [babinsa, notif],
      headsUpParams = {
        registration_ids: deviceTokens.flat(),
        topic: '/topics/news',
        priority: 10,
        data: {
          title: `${kasus[checkedKasus]} di ${this.currentUsr().wilayah} oleh ${constants.formatPhoneNumber(this.currentUsr().telp)}`, 
          body: captions,
          image: photoSource,
          targets: actors
        }
      }

    try {
      this.scrollView.scrollToEnd({animated: true})
      tasks[0].set(taskTitle[0], {merge: true}).then(() => {
        tasks[1].set(taskTitle[1])
          .then(() => {
            constants.sendMessage(headsUpParams)
            this.nav().pop() 
            alert('Berhasil terkirim, laporan tersebut sedang di proses.')
          })
          .catch((err) => console.log(err))
      })

    } catch (error) {
      console.log(error)
    }
      
  }

  render() {
    const 
      { loading, kasus, yth, checkedKasus, opening, isKasusPanen, locality, subLocality, photoSource,imgPath} = this.state,
      { navigation } = this.props,
      selectionOpt = (key) => key == checkedKasus && {borderWidth:2, borderColor:  constants.clr_btn_bg_root} //, title = navigation.getParam('title'), navigate = (screen, param) => navigation.navigate(screen, param)
    
    return (
      <ScrollView ref={(ref) => this.scrollView = ref} style={{flex:1, backgroundColor: constants.clr_bg_root}}>
        <constants.Header mProps={{navigation, isHideBackButton: loading, title: constants.menu_babinsa_2}} />
      
      { this.currentItms().isKoramilSent ? <Text style={[styles.page_title, {marginHorizontal:15, marginTop:45, textAlign:'center'}]}>LAPORAN HARI INI SUDAH DITUTUP</Text> :
        <View style={styles.header}>
          {
            this.currentItms().photoSource?.url.length ? <Image style={styles.article_header} source={{uri: this.currentItms().photoSource?.url}} />
            : <constants.SubmitModule style={styles.article_header} upload={imgPath} />
          }
          <constants.LocationModule style={[styles.map_box]} />
            <View style={{flex:1, flexDirection: 'row', alignSelf: 'stretch'}}>
            {
              kasus.map((data, key) => 
              <TouchableOpacity key={key} activeOpacity={0.7} style={[styles.inp_tx_normal, {flex: 0.5, alignItems:'center', margin:3}, selectionOpt(key)]} onPress={() => 
                this.setState({checkedKasus: key, isKasusPanen: key == 1 && false})
              }>
                  <Text style={{color: key === checkedKasus ? constants.clr : 'white'}}>{data.toUpperCase()}</Text>
              </TouchableOpacity>
              )
            }
            </View>
            <View style={styles.inp_container}>
            {
              isKasusPanen
              ? <Text style={[styles.inp_tx_normal, {flex: 0.8, padding:13}]}>Pendampingan Panen</Text> 
              : <TextInput style={[styles.inp_tx_normal, {flex: 0.8}]} placeholder={checkedKasus == 0 ? 'Nama Kegiatan' : 'Nama Kejadian'} keyboardType="default"
                  onChange={(event) => this.setState({kasusName: event.nativeEvent.text})}/>
            }  
              <TouchableOpacity style={{flex: 0.2, alignItems: 'center'}} activeOpacity={0.5} onPress={() => checkedKasus == 0 ? this.setState({isKasusPanen: !isKasusPanen}) : null}>
                <Image style={{width:25, height:25, padding:25, tintColor: constants.clr_btn_bg_root}} source={require("../src/assets/baseline_code_black_48.png")} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.inp_tx_normal} placeholder="Kecamatan" keyboardType="default" defaultValue={locality} 
              onChange={(event) => this.setState({kecamatan: event.nativeEvent.text})}/>
            <TextInput style={styles.inp_tx_normal} placeholder="Nagari/ Kelurahan /Desa" keyboardType="default" defaultValue={subLocality} 
              onChange={(event) => this.setState({nagari: event.nativeEvent.text})}/>
        {
          checkedKasus == 1
          ? <View style={{alignSelf: 'stretch'}}>
              <TextInput style={styles.inp_tx_normal} placeholder="Korban" keyboardType="default" 
                onChange={(event) => this.setState({korban: event.nativeEvent.text})}/>
              <TextInput style={styles.inp_tx_normal} placeholder="Kerusakan" keyboardType="default" 
                onChange={(event) => this.setState({kerusakan: event.nativeEvent.text})}/>
            </View>
          : <View style={{alignSelf: 'stretch'}}>
              <TextInput style={styles.inp_tx_normal} placeholder="Jorong/ Kampung" keyboardType="default" 
                onChange={(event) => this.setState({jorong: event.nativeEvent.text})}/>
                
            {
              isKasusPanen &&
              <View style={{alignSelf: 'stretch'}}>
                <TextInput style={styles.inp_tx_normal} placeholder="Poktan" keyboardType="default" 
                  onChange={(event) => this.setState({poktan: event.nativeEvent.text})}/>
                <TextInput style={styles.inp_tx_normal} placeholder="Ketua Poktan" keyboardType="default" 
                  onChange={(event) => this.setState({ketuaPoktan: event.nativeEvent.text})}/>
                <TextInput style={styles.inp_tx_normal} placeholder="Pemilik Lahan" keyboardType="default" 
                  onChange={(event) => this.setState({pemilikLahan: event.nativeEvent.text})}/>
                <TextInput style={styles.inp_tx_normal} placeholder="Luas" keyboardType="default" 
                  onChange={(event) => this.setState({luas: event.nativeEvent.text})}/>
                <TextInput style={styles.inp_tx_normal} placeholder="Varitas" keyboardType="default" 
                  onChange={(event) => this.setState({varitas: event.nativeEvent.text})}/>
              </View>
            }
            </View>
        }
          <TextInput style={[styles.inp_tx_normal, {marginBottom: 10}]} placeholder="Bantuan" keyboardType="default"  
            onChange={(event) => this.setState({bantuan: event.nativeEvent.text})}/>
          
          <Text style={styles.inp_tx_normal} onPress={() => {
            // constants.SlideListModule.show(constants.loopArray(
            //   constants.openingBy(this.currentUsr().kesatuan).map(x => x.to)
            // )).then(to => this.setState({yth: to }))
          }}>{constants.openingBy(this.currentUsr().kesatuan).map(x => x.to)[0]}</Text>

          <TextInput style={[styles.inp_tx_normal, {marginBottom: 10}]} placeholder="Kronologi/ Keterangan" keyboardType="default"  
            onChange={(event) => this.setState({captions: event.nativeEvent.text})} defaultValue={this.currentItms().captions != null ? this.currentItms().captions : ''}/>
          <TouchableOpacity style={styles.btn_toucher} disabled={loading} activeOpacity={0.5} onPress={() => 
            this.currentItms().photoSource?.url.length 
            ? this.setState({photoSource: this.currentItms().photoSource.url, isImagePlaced: true}, this.onFormAttampted)
            : this.onFormAttampted()}>
            <Text style={styles.btn_normal}>Kirim</Text>
          </TouchableOpacity>
          { loading && constants.progress()}
        </View>
      }
      </ScrollView>
    );
  }
}
