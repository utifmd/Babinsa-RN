/**
 * Sample React Native App 
 * https://github.com/facebook/react-native
 * Babinsa App accounts
 * https://github.com/facebook/react-native
 * (dev) Utif milkedori 0895357037744
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Alert, NativeModules, Text, View, ScrollView, Image, TouchableOpacity, DeviceEventEmitter} from 'react-native'
import styles from '../src/design/styles'
import * as constants from '../src/utils/constants'
import messaging from '@react-native-firebase/messaging'
import firebaseApp from '@react-native-firebase/app'

const { PrefModule } = NativeModules

export default class App extends Component {
  constructor(){
    super()
    this.state = this.initialState  //this._bootstrapAsync() //this.eventListener = null//+6284242424242
    
    this.fcmTokenListener = null
    this.fcmFrontListener = null
    this.xpanelListener = null
    this.notifListener = null
    this.usersListener = null
    this.postCitizenListener = null
    this.postBabinsaListener = null
    this.postKoramilListener = null
    this.onOfficeSentListener = null
  }
  
  initialState = {
    keyPref: 'Before Firestore',
    xpanel: null,
    addressLine: '', 
    locality: '', 
    subLocality: '',
    status: '',
    opKodimKey: [],
    dandimKey: [],
    loading: true,
    isCloseReport: false,
    isKodimSent: false,
    isKoramilSent: false,
    isIPostedToday: false,
    contributor: [],
    feed: [],
    koramilCover: '',
    babinsaMultiPosts: [],
    babinsaPosts: [],
    koramilPosts: [],
    opKodimTokens: [], 
    opDandimTokens: [],
    user: {},
    users: [],
    oneOffice: [],
    inbox: [],
    checkedCloseReport: 0,
    ibxKoramilPercent: 0.0,
    ibxBabinsaPercent: 0.0,
    closeReportList: [`Operasional berlangsung`, 'Hari Baru'],
    notifications: []
  }  // _bootstrapAsync = async () => {  // 	await PrefModule.load('key', data => {  // 		data && this.setState({user: JSON.parse(data)})  // 	})  // }

  UNSAFE_componentWillReceiveProps = () => {
    PrefModule.load('key', data => data && this.setState({loading: false, user: JSON.parse(data)}))
    this.databaseListener()
  }

  componentDidMount = () => {
    this.nativeListener()
    this.databaseListener()
  }

  componentWillUnmount = () => {
    this.eventListener.remove()
    this.fcmTokenListener()
    this.fcmFrontListener()
    this.xpanelListener()
    this.notifListener()
    this.usersListener()
    this.postCitizenListener()
    this.postBabinsaListener()
    this.postKoramilListener()
    this.onOfficeSentListener()
  }

  nativeListener = () => {
    this._bootstrapAsync = PrefModule.load('key', data => data && this.setState({user: JSON.parse(data)})) //, () => console.log(JSON.stringify(JSON.parse(data), null, 2))))
    this.eventListener = DeviceEventEmitter.addListener('LocationModule', this.onLocationUpdate)
  }

  databaseListener = () => {
    this.fcmFrontListener = messaging().onMessage(this.onFcmMessageUpdate)
    this.fcmTokenListener = messaging().onTokenRefresh(this.onTokenUpdate)
    this.xpanelListener = constants.dbRef('xpanel').onSnapshot(this.onXpanelUpdate)
    this.usersListener = constants.dbRef('users').onSnapshot(this.onUsersUpdate)
    this.notifListener = constants.dbRef('notifications').onSnapshot(this.onNotificationUpdate)
    this.onOfficeSentListener = constants.dbRef('office').onSnapshot(this.onOfficeSentUpdate)
    this.postCitizenListener = constants.dbRef('post_masyarakat').onSnapshot(this.onCitizenPostUpdate)
    this.postBabinsaListener = constants.dbRef('post_babinsa').onSnapshot(this.onBabinsaPostUpdate)
    this.postKoramilListener = constants.dbRef('post_koramil').onSnapshot(this.onKoramilPostUpdate)
  }

  onFcmMessageUpdate = (message) => {
    let {messageId, messageType, collapseKey, data, to, ttl} = message
    if(data != null){
      if(data.targets.includes(this.user().key)){
        try {
          constants.NotificationModule.show(true, message)
        } catch (error) { 
          console.log(error) 
        }
      }
    }
    
    console.log('forground recieved')
  }

  onTokenUpdate = (newToken) => {
    this.isSignedIn()
    ? constants.updateToken(this.state.user, newToken).then(account => console.log(JSON.stringify(account, null, 2)))
        .catch(err => console.log('token error while updating'))
    : console.log('User does not exist.') //console.log('Refresh token: ', newToken)
  }

  onXpanelUpdate = (snapshot) => {
    let xpanel = null
    !snapshot.empty
    ? snapshot.forEach(panel => {
        xpanel = panel.data()
      })
    : console.log('xpanel unknown') //console.log(JSON.stringify(xpanel, null, 2))
    this.setState({xpanel, loading: false})
  }

  onUsersUpdate = (snapshot) => {
    let users = []
      
    snapshot.forEach(snapData => { users.push(snapData.data()) })

    let
      opKodim = users.filter(usr => usr.kesatuan == 'Kodim 0307/ Tanah Datar' && usr.level == constants.level_op_kodim),
      opDandim = users.filter(usr => usr.kesatuan == 'Kodim 0307/ Tanah Datar' && usr.level == constants.level_dandim)
      opKodimKey = opKodim.map(x => x.key),
      dandimKey = opDandim.map(x => x.key),
      opKodimTokens = opKodim.map(x => x.deviceToken),
      opDandimTokens = opDandim.map(x => x.deviceToken),
      oneOffice = this.user().level == constants.level_op_koramil ? users.filter(x => x.level == constants.level_babinsa && x.kesatuan == this.user().kesatuan)
        : this.user().level == constants.level_op_kodim ? users.filter(x => x.level == constants.level_op_koramil)// && x.kesatuan == this.user().kesatuan)
        : []

    this.setState({users, opKodimKey, dandimKey, oneOffice, opKodimTokens, opDandimTokens})
    console.log('oneOffice', oneOffice.length)
  }

  onCitizenPostUpdate = (snapData) => {
    let inbox = [], tmp = [], { } = this.state
    
    snapData.forEach((values, keys) => {
      values.exists ? inbox.push(values.data())
      : this.setState({loading: false}, () => console.log('values doesnt not exist.'))
    })
    
    let counter = inbox.map(x => x.by.telp).reduce((left, right) => {
        left[right] = (left[right] || 0) + 1

        return left
      }, {})

    Object.entries(counter).forEach(([key, value], idx) => {
        tmp.push({key, value})
    })

    let contributor = tmp.sort((a, b) => b.value - a.value).slice(0, 2)

    //console.log(JSON.stringify(contributor, null, 2))
    this.isBabinsa() && this.setState({contributor})
  }
  
  onBabinsaPostUpdate = (snapData) => {
    let inbox = [], { oneOffice } = this.state
    snapData.forEach((values, keys) => {
      values.exists
      ? inbox.push(values.data())
      : this.setState({loading: false}, () =>  console.log('values doesnt not exist.'))
    }) //.reduce((a, z) => z.concat(a))

    if(this.isOpKoramil()){
      let babinsaPosts = inbox.length > 0 
          ? inbox.filter(x => !x.posts.expired && x.by.kesatuan == this.user().kesatuan)
              .filter((x, i, self) => self.findIndex(v => v.by.key === x.by.key) === i) //x.by.key.indexOf(x.by.key) != i) //.filter((x, i) => x.by.key.indexOf(x.by.key) != i) //<~ this magic is a formula to unlist the DUPLICATE value
          : [],
        babinsaGlobalPosts = inbox.length > 0 ? inbox.filter(x => !x.posts.expired && x.by.kesatuan == this.user().kesatuan) : [],
        ibxBabinsaPercent = parseFloat((babinsaPosts.length / oneOffice.length * 100).toFixed(1))

      console.log('babinsaPosts.length', JSON.stringify(babinsaPosts.length, null, 2))
      this.setState({babinsaPosts, babinsaGlobalPosts, ibxBabinsaPercent, loading: false})
    }

    // FEEED BEGIN
    let feed = inbox.length > 0 ? inbox.filter(x => x.posts.expired && x.posts.kasus == 'kejadian').sort((a, b) => b.creationTime - a.creationTime) : [],
    
    // CONTRIBUTE BEGIN
    topThreeCounter = inbox.length > 0 
    ? inbox.map(x => x.by.key).reduce((left, right) => {
        left[right] = (left[right] || 0) + 1
        return left
      }, {})
    : [], 
    // MERGE VALUE TO DATA
    fillTopThree = [] //,
    
    Object.entries(topThreeCounter).forEach(([key, value], idx) => {
      fillTopThree.push({key, value, by: inbox.filter(x => x.by.key == key).map(x => x.by)[0]})
    }) //console.log(JSON.stringify(fillTopThree.length, null, 2))

    let contributor = fillTopThree.sort((a, b) => b.value - a.value).slice(0, 2)
    
    this.setState({feed, contributor: !this.isBabinsa() ? contributor : this.state.contributor})
  }

  onKoramilPostUpdate = async (snapData) => {
    let inbox = [], { oneOffice } = this.state
    snapData.forEach((values, keys) => {
      values.exists
      ? inbox.push(values.data())
      : this.setState({loading: false}, () => console.log('values doesnt not exist.'))
    })
  
    if(this.isOpKodim()){
      let 
        koramilPosts = inbox.length > 0 ? inbox.filter(x => !x.expired) : [],
        ibxKoramilPercent = parseFloat((koramilPosts.length / oneOffice.length * 100).toFixed(1))
  
      console.log('koramilPosts.length', JSON.stringify(inbox.length, null, 2))
      this.setState({koramilPosts, ibxKoramilPercent})
    }

    this.setState({loading: false})
  }

  onLocationUpdate = (val) => { //console.log('LocationModule called.')
    let { locality, subLocality, addressLine} = val

    val != null && this.setState({addressLine, locality, subLocality})
  }
  
  onNotificationUpdate = (snapData) => { //console.log('onNotificationUpdate()')
    let ntf = []
    snapData.forEach(val => { //let {by, relatedKey, wilayah, creationTime, key, kasus} = val.data()
      val.exists
      ? ntf.push(val.data())
      : console.log('val down not exist') 
    })

    let data = ntf.filter(xNtf => !xNtf.read && xNtf.targets.includes(this.user().key)).map(x => x) //Filter notif to current user
    
    data != null &&
      this.setState({notifications: data})
      
      this.user().key != null && console.log('cur user: '+this.user().key+ '')
  }

  user = () => this.state.user && this.state.user
  
  isSignedIn = () => { 
    let result = false, { user } = this.state
    
    if(user != null && user.key != null){
      result = true
      //console.log('isSignedIn true')
    }
    
    return result
  }

  navigate = (screen, param) => this.props.navigation.navigate(screen, param)

  signOut = () => {
    let message = this.user().name 
      ? `Anda ingin keluar aplikasi sebagai ${this.user().name}?` 
      : 'Fitur ini hanya untuk staff khusus TNI-AD, anda yakin?'
    Alert.alert(this.user().name ? 'Keluar' : 'Masuk', message, [{text:'Ya', onPress:() => {
      try {
        this.user().name && constants.signOut()
        this.setState(this.initialState, () => this.setState({loading: false}, () => this.navigate('LoginScreen')))
      } catch (error) {
        this.setState({loading: false}, () => alert(`${error}`))
      }
    }}], {cancelable: true})
  }

  isBabinsa = () => {
    let result = false
    if(this.user().level === constants.level_babinsa){
      result = true
    }
    return result
  }

  isOpKoramil = () => {
    let result = false
    if(this.user().level === constants.level_op_koramil){
      result = true
    }
    return result
  }
  
  isOpKodim = () => {
    let result = false
    if(this.user().level === constants.level_op_kodim ){
      result = true
    }
    return result
  }
  
  isDandim = () => {
    let result = false
    if(this.user().level === constants.level_dandim ){
      result = true
    }
    return result
  }

  onSubmitRecapt = () => { //<~ BABINSA TO KORAMIL NICE. NEXT KORAMIL TO OP KODiM or OP KODIM TO KODIM
    let {babinsaMultiPosts, babinsaPosts, koramilPosts, koramilCover, opKodimTokens, opDandimTokens, dandimKey, opKodimKey, closeReportList, checkedCloseReport} = this.state
    
    if(babinsaPosts.length > 0 || koramilPosts.length > 0){
      let 
        task = this.isOpKoramil() ? constants.dbRef('post_koramil').doc() : constants.dbRef('post_kodim').doc(),
        ntfRef = constants.dbRef('notifications').doc(),
        pid = task.id,
        date = new Date(),
        by = { kesatuan: this.user().kesatuan, keyNtf: ntfRef.id, key: this.user().key, name: this.user().name },
        targets = this.isOpKoramil() ? opKodimKey  : this.isOpKodim() ?  dandimKey : [],
        data = {
          key: pid,
          creationTime: Date.now(),
          day: date.getDate(),
          month: date.getMonth()+1,
          year: date.getFullYear(),
          expired: false,
          targets,
          photoSource: {path: `images/office/Koramil${this.user().kesatuan.split(' ')[1]}.png`, url: koramilCover},
          by,
          relatedDoc: this.isOpKoramil() 
            ? { title: 'post_babinsa', postedToday: babinsaMultiPosts.map(x => x.key) } 
            : { title: 'post_koramil', postedToday: koramilPosts.map(x => x.key) }
        },
        notifications = {
          key: ntfRef.id,
          kasus: closeReportList[checkedCloseReport],
          relatedDoc: this.isOpKoramil() ? {title: 'post_koramil', key: pid} :  {title: 'post_kodim', key: pid},
          photoSource: koramilCover,
          by, 
          targets,
          read: false,
          wilayah: this.user().wilayah, 
          creationTime: Date.now()
        },
        tasks = [task, ntfRef],
        tasksData = [data, notifications],
        headsUpParams = {
          registration_ids: this.isOpKoramil() ? opKodimTokens.flat() : opDandimTokens.flat(),
          topic: '/topics/news',
          priority: 10,
          data: {
            title: this.isOpKoramil()
              ? `Hi Operator Koramil, Anda menerima laporan baru dari ${this.user().name} hari ini`
              : `Hi Komandan Kodim, Anda menerima laporan baru dari ${this.user().name} hari ini`, 
            body: this.isOpKoramil()
              ? `${this.user().name} dari kesatuan ${this.user().kesatuan} mengajukan laporan data baru silahkan dibuka.`
              : `${this.user().name} dari kesatuan ${this.user().kesatuan} mengajukan rekap data baru silahkan dibuka.`,
            image: koramilCover,
            targets: targets //photoSource
          }
        }
      
    if (this.isOpKoramil() || this.isOpKodim()) {
      try {
        if(this.isOpKoramil()){ console.log('this.isOpKoramil() is run..')
          babinsaMultiPosts.map((babinsa, i) => {
            constants.dbRef('post_babinsa').where('key', '==', babinsa.key).get().then((snapshot) =>
              snapshot.forEach((snapData) => 
                snapData.ref.set({posts:{expired: true}}, {merge: false}).then(() => console.log('expire true.')).catch(err => console.log(err)))
            )
          })
        }else if (this.isOpKodim()){ console.log('this.isOpKodim() is run..')
          koramilPosts.map((koramil, i) => {
            constants.dbRef('post_koramil').where('key', '==', koramil.key).get().then((snapshot) =>
              snapshot.forEach((snapData) => //console.log('snapData.exists')
                snapData.ref.set({expired: true}, {merge: false}).then(() => console.log('expire true.')).catch(err => console.log(err)))
            )
          })
        }

        constants.dbRef('office').where('nama', '==', this.user().kesatuan).get().then(snapshot => snapshot.forEach(snapDoc => snapDoc.ref.set({storedToday: true}, {merge: false})))
            
        tasks.map((xTask, i) => {
          xTask.set(tasksData[i]).then(() => this.setState({isKoramilSent: true})).catch(err => console.log(err))
        }) && constants.sendMessage(headsUpParams)

      } catch (error) { console.log(error) }}   
      
    } else alert(`Tidak dapat mengirimkan laporan dalam keadaan kosong.`)
  }

  attemptRecaptData = () => {
    let { isKoramilSent, oneOffice, babinsaMultiPosts, babinsaPosts, koramilPosts } = this.state, title = '', message = '', options = []

    if(babinsaPosts.length == oneOffice.length || koramilPosts.length == oneOffice.length){
      title = 'Rekap data?'.toUpperCase()
      message = `Apakah anda ${this.user().name} bertanggung jawab untuk mengirimkan rekap laporan kegiatan hari ini per tanggal ${constants.parseDate(Date.now())} atas nama ${this.user().kesatuan} kepada ${constants.openingBy('')[1].to}`
      options = [
        {text: 'Detail'.toUpperCase(), onPress: () => this.navigate('ReportScreen', {
          title: this.isOpKodim() ? constants.menu_op_kodim_1 : this.isOpKoramil() ? constants.menu_op_koramil_1 : constants.menu_babinsa_1, state: this.state
        })},
        {text: 'Batal'.toUpperCase()},
        {text:'Ya'.toUpperCase(), onPress: this.onSubmitRecapt}
      ]
    }else{
      title = 'Informasi Terkini'.toUpperCase()
      message = `${ this.isOpKodim() ? koramilPosts.length : babinsaPosts.length} dari ${oneOffice.length} anggota yang melaporkan sejauh ini per tanggal ${constants.parseDate(Date.now())}`
      options = [{text: 'ok'.toUpperCase()}]
    }

    Alert.alert(title, message, options)
  }

  onOfficeSentUpdate = (snapshot) => { let data = []
    !snapshot.empty 
    ? snapshot.forEach(snapData => {
        data.push(snapData.data())
      })
    : console.log('kosong.')
    
    let 
      photoSource = data.filter(x => x.nama == this.user().kesatuan).map(x => x.photoSource),
      isKoramilSent = data.filter(x => x.nama == this.user().kesatuan && x.storedToday),
      isKodimSent = data.filter(x => x.nama == 'Kodim 0307/ Tanah Datar' && x.storedToday)

    this.setState({
      koramilCover: photoSource.length > 0 ? photoSource[0] : '',
      isKoramilSent: isKoramilSent.length > 0 ? true : false,
      isKodimSent: isKodimSent.length > 0 ? true : false
    })
    //console.log('koramilCover', photoSource)
  }

  opKodimPrevilege = () => { //<~ it means that all request will be open on new day 
    let 
      table = ['office', 'post_koramil', 'post_kodim', 'xpanel'],
      value = [{ storedToday: false }, { expired: true }, { expired: true }, {onGoingProccess: Date.now()}],
      title = 'Reset operasional',
      message = 'Dengan ini seluruh jajaran koramil dan babinsa akan mengirimkan laporan baru',
      options = [{text: 'Batal'}, {text: 'Ya, perbarui', onPress: () => {
        table.map((x, i) => 
          constants.dbRef(table[i]).get().then((snapshot) => {
            !snapshot.empty
            ? snapshot.forEach(snapData => { //console.log(JSON.stringify(snapData.data(), null, 2))
                snapData.ref.set(value[i], {merge: false})
                  .then(() => console.log('Reset completed')).catch(err => console.log(err))
              })
            : console.log('empty snapshot')
          }).catch(err => console.log(err))
        )
      }}]

    Alert.alert(title, message, options)
  }

  render() {
    const 
      {name, pwd, telp, level, lastSignInTime, key, kesatuan, jabatan, creationTime} = this.state.user,
      {contributor, addressLine, checkedCloseReport, ibxBabinsaPercent, ibxKoramilPercent, closeReportList, locality, koramilPosts, babinsaPosts, feed, isKodimSent, isKoramilSent, xpanel, loading, users, subLocality, oneOffice, inbox, notifications} = this.state,
      selectionOpt = (key) => key == checkedCloseReport && {borderWidth:2, borderColor:  constants.clr_btn_bg_root}

      return (
      <ScrollView style={styles.container}>
      { !loading ?
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.toolbar}>
              <TouchableOpacity activeOpacity={0.5} onPress={()=> null}>
                <Image style={styles.iconbar} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={()=> this.signOut()}>
                <Image style={styles.iconbar} source={require("../src/assets/ic_expand.png")} resizeMode="contain" />              
              </TouchableOpacity>
            </View>
            <Text style={styles.welcome}>Selamat Datang { this.user().jabatan }
            </Text>
            <constants.separatorApp />
            <View style={{height:45}} />
          </View>
        { notifications.length > 0 ?
          <View style={{paddingHorizontal:10}}>
            <Text style={[styles.page_title, {marginBottom:5}]}>{ this.isOpKoramil() 
              ? `LAPORAN MASUK`
              : this.isOpKodim()
              ? `REKAP KORAMIL TERKINI`
              : (this.isBabinsa() || this.isDandim())
              ? `NOTIFIKASI TERKINI`
              : ''
              }
            </Text> 
          { this.isOpKodim() && //OP KODIM PROGRESS REMAINING
              <TouchableOpacity disabled={isKodimSent} style={{flex:1, borderWidth:2.5, borderColor: constants.clr_btn_bg_root, width: '100%', alignContent: 'flex-end'}} 
                activeOpacity={0.7} onPress={this.attemptRecaptData}>
              { !isKodimSent 
                ? koramilPosts.length == 0
                ? <Text numberOfLines={1} style={{textAlign: 'center', padding:10, fontSize: 16, color: constants.clr_btn_bg_root}}>
                    {`${ibxKoramilPercent}% sedang berlangsung`.toUpperCase()}</Text>
                : <View style={{flex:1, backgroundColor: isKodimSent ? constants.clr_placeholder : constants.clr_light, width: `${ibxKoramilPercent}%`, padding:10}}>
                    <Text numberOfLines={1} style={{textAlign: 'center', fontSize: 16, color: constants.clr_btn_bg_root}}>
                      {`${ibxKoramilPercent}% ${!isKodimSent ? 'selesai' : 'berlangsung'}`.toUpperCase()}</Text>
                  </View>
                : <Text numberOfLines={1} style={{textAlign: 'center', padding:10, fontSize: 16, color: constants.clr_btn_bg_root}}>
                    {`Selesai`.toUpperCase()}</Text>
              }
              </TouchableOpacity>
          }
          { this.isOpKoramil() && //OP KORAMIL PROGRESS REMAINING
              <TouchableOpacity disabled={isKoramilSent} style={{flex:1, borderWidth:2.5, borderColor: constants.clr_btn_bg_root, width: '100%', alignContent: 'flex-end'}} activeOpacity={0.7} onPress={this.attemptRecaptData}>
              { !isKoramilSent 
                ? babinsaPosts.length  == 0
                ? <Text numberOfLines={1} style={{textAlign: 'center', padding:10, fontSize: 16, color: constants.clr_btn_bg_root}}>{`${ibxBabinsaPercent}% sedang berlangsung`.toUpperCase()}</Text>
                : <View style={{flex:1, backgroundColor: isKoramilSent ? constants.clr_placeholder : constants.clr_light, width: `${ibxBabinsaPercent}%`, padding:10}}>
                    <Text numberOfLines={1} style={{textAlign: 'center', fontSize: 16, color: constants.clr_btn_bg_root}}>{`${ibxBabinsaPercent}% ${!isKoramilSent ? 'selesai' : 'berlangsung'}`.toUpperCase()}</Text>
                  </View> 
                : <Text numberOfLines={1} style={{textAlign: 'center', padding:10, fontSize: 16, color: constants.clr_btn_bg_root}}>{`Selesai`.toUpperCase()}</Text>
              }
              </TouchableOpacity>
          }
          { (this.isBabinsa() || this.isDandim()) && 
            notifications.sort((a, b) => b.creationTime - a.creationTime).slice(0, 3).map((data, idx) => { // FILTER BY PERSONAL ACCESS & BY SAME WILAYAH
              let {key, relatedDoc, kasus, wilayah, by, creationTime} = data
                
              return(
                <TouchableOpacity key={key} activeOpacity={0.9} onPress={() => {
                  this.navigate('ReportScreen', this.isBabinsa() ? {title:constants.menu_babinsa_1, state: this.state, items: {key: relatedDoc.key}} 
                    : {title: constants.menu_dandim_2, state: this.state, items: {key: relatedDoc.key}})

                  // this.navigate('ArticleScreen', {state: this.state, item: {relatedDoc, by}}) 
                  // && constants.dbRef('notifications').doc(key).update({read: true}).then(() => console.log('read true')).catch(err => console.log(err))
                }}>
                    <View style={styles.btn_notice}>
                      <Text style={{fontSize:9}}>{constants.parseMoment(creationTime)}</Text>
                      <Text numberOfLines={1}>{`${kasus.toUpperCase()} di ${wilayah} oleh ${by.kesatuan} sekitar Kabupaten Tanah Datar.`}</Text>
                    </View>
                </TouchableOpacity>
              )
            })
          }
          
          {/* this line to apearing some block diagram top 3 reporter contributor */
            
          }

            <Text style={[styles.page_title, {marginTop:5}]}>MENU UTAMA</Text>
          </View> : null
        }
        { this.isOpKodim() &&
          <View style={{flex:1, flexDirection:'row', padding:10}}>
            <Text style={{flex: 0.5, padding:10, backgroundColor: constants.clr_placeholder, color: constants.clr_btn_bg_notice, textAlign: 'center'}}>Sedang berlangsung{`\n${xpanel != null && xpanel.onGoingProccess != null && constants.parseDate(xpanel.onGoingProccess)}`}</Text>
            <TouchableOpacity disabled={!isKodimSent} style={{flex: 0.5}} activeOpacity={0.7}  
              onPress={this.opKodimPrevilege} >
              <Text style={{padding:10, backgroundColor: constants.clr_light, color: constants.clr_btn_bg_root, textAlign: 'center'}}>Perbarui & Publish{`\n${constants.parseDate(Date.now())}`}</Text>
            </TouchableOpacity>
          </View>
        }
          <View style={styles.header}>
            { level == constants.level_babinsa
              ? <View style={{alignSelf: 'stretch'}}>
                  {constants.mainItem(constants.menu_babinsa_1, () => this.navigate('ReportScreen', {title:constants.menu_babinsa_1, state: this.state}))}
                  {constants.mainItem(constants.menu_babinsa_2, () => this.navigate('SubmitScreen', {title:constants.menu_babinsa_2, user: this.user(), items: {isKoramilSent}})) }
                </View>
              : level == constants.level_op_koramil
              ? <View style={{alignSelf: 'stretch'}}>
                  {constants.mainItem(constants.menu_op_koramil_1, () => this.navigate('ReportScreen', {title: constants.menu_op_koramil_1, state: this.state}))}
                  {constants.mainItem(constants.menu_op_koramil_2, () => this.navigate('ActivateduserScreen', {title: constants.menu_op_koramil_2, user: this.user()})) }
                  {/*constants.mainItem(constants.menu_op_koramil_3, () => this.navigate('PhotoUploaderScreen', {title: constants.menu_op_koramil_3, state: this.state}))*/}
                </View>
              : level == constants.level_op_kodim
              ? <View style={{alignSelf: 'stretch'}}>
                  {constants.mainItem(constants.menu_op_kodim_1, () => this.navigate('ReportScreen', {title: constants.menu_op_kodim_1, state: this.state}))}
                  {/*// constants.mainItem(constants.menu_op_kodim_2, () => this.navigate('PdfviewerScreen', {title: constants.menu_op_kodim_2}))*/}
                  {constants.mainItem(constants.menu_op_kodim_3, () => this.navigate('ActivateduserScreen', {title: constants.menu_op_kodim_3}))}
                </View>
              : level == constants.level_dandim
              ? <View style={{alignSelf: 'stretch'}}>
                  {/*constants.mainItem(constants.menu_dandim_1, () => null)*/}
                  {constants.mainItem(constants.menu_dandim_2, () => this.navigate('ReportScreen', {title: constants.menu_dandim_2, state: this.state}))}
                  {constants.mainItem(constants.menu_dandim_3, () => this.navigate('ActivateduserScreen', {title: constants.menu_dandim_3}))}
                </View>
              : level == constants.level_developer
              ? constants.developerItems(this.navigate, this.user())
              : constants.mainItem(constants.menu_guest, () => this.navigate('SnapsendScreen', {title: constants.menu_guest}))
            }
          </View>
          
          <View style={styles.body}>
            <TouchableOpacity activeOpacity={0.7} style={styles.user_box} disabled={!this.user().name} onPress={() => this.navigate('SelfUpdateScreen', {state: this.user()})}>
              <View style={{alignSelf: 'stretch'}}>
                <Text style={styles.user_box_label}>{kesatuan ? kesatuan : 'Masyarakat'}</Text>
              </View>
              <View style={styles.user_box_ava}></View>
              <View style={{alignSelf: 'stretch', margin:5}}>
                <Text style={styles.user_box_title}>{name}</Text>
              </View>
              <View style={{alignSelf: 'stretch'}}>
                <Text style={styles.user_box_caption}>{jabatan}</Text>
                <Text style={styles.user_box_caption}>{this.user().wilayah ? `Wilayah operasi ${this.user().wilayah}` : ''}</Text>
              </View>
            </TouchableOpacity>
            <constants.LocationModule style={styles.map_box} />
            { this.user().key != null &&
              <View style={{alignSelf: 'stretch'}}>
                <Text style={styles.page_title}>{this.isBabinsa() ? 'MASYARAKAT TERAKTIF' : 'BABINSA TERAKTIF'}</Text>
              { contributor.length > 0 // && this.isBabinsa() 
                ? <View style={{flex:1, marginTop:20, marginBottom:10, alignSelf: 'stretch', flexDirection: 'row', alignContent: 'space-between'}}> 
                    { contributor.map((x, i) => 
                      <TouchableOpacity key={i} activeOpacity={0.7} style={{flex:3, margin:2.5, backgroundColor: constants.clr_bg_item}} onPress={() => 
                        x.by != null ? alert(`Top ${i+1} kontributor: ${x.by.name} (${x.by.kesatuan})`)
                        : alert(`Top ${i+1} kontributor: `+x.key)
                      }>
                        <Text numberOfLines={1} style={[i == 0 ? {backgroundColor: '#AF9500'} : i == 1 ? {backgroundColor: '#B4B4B4'} : {backgroundColor: '#AD8A56'}, {padding:10, color: constants.clr_text_dark, marginHorizontal: 17, top: -15}]}>
                          {x.by != null ? x.by.name : x.key}
                        </Text>
                        <Text style={[i == 0 ? {color: '#AF9500'} : i == 1 ? {color: '#B4B4B4'} : {color: '#AD8A56'}, {alignSelf: 'center', marginBottom:20, fontSize: 32, fontWeight: 'bold'}]}>{i+1}</Text>
                      </TouchableOpacity>
                      )
                    }
                  </View>
                : null
              }
              </View>
            }
            <Text style={styles.page_title}>KEJADIAN TERKINI</Text>
          { feed.length > 0 && 
            feed.map((x, i) => 
            <View key={i} style={styles.item_box}>
              <TouchableOpacity style={styles.item_box_left} onPress={() => this.props.navigation.navigate('ImagePreviewScreen', {preview: x.photoSource.url})}>
                <Image style={{width:'100%', height: '100%'}} resizeMode="cover" source={{uri: x.photoSource.url}}></Image>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item_box_right} activeOpacity={0.5} onPress={() => this.navigate('ArticleScreen', {state: this.state, item: {relatedDoc: {title: 'post_global', key: x.key}}})}>
                <View style={styles.item_box_right_body}>
                  <Text style={styles.item_box_tx_label}>{x.wilayah}</Text>
                  <Text style={styles.item_box_tx_body}>{x.posts.captions.slice(0, 45)+' ...'}</Text>
                </View>
                <Text style={styles.item_box_tx_footer}>{constants.parseMoment(x.creationTime)}</Text>
              </TouchableOpacity>
            </View>
            )
          }
          </View>
        </View>
        : <constants.itemPlaceHolder />
      }
      </ScrollView>
    );
  }
}

