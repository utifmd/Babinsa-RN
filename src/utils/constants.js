import React, {Component} from 'react'
import { Alert, DatePickerAndroid, YellowBox, ActivityIndicator, BackHandler, requireNativeComponent, NativeModules, View, TouchableOpacity, Image, Text } from 'react-native'
import styles from '../design/styles'
//import firebase, {firestore} from 'react-native-firebase'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import functions from '@react-native-firebase/functions'
import messaging from '@react-native-firebase/messaging'
import firestorage from '@react-native-firebase/storage'
import moment from 'moment'
import 'moment/locale/id'
// import admin from 'firebase-admin';

export const key_pref_empty = 'Nothing to show'
export const clr_bg_root = '#254F6E'
export const clr_light = '#F5FCFF'
export const clr_placeholder = '#D5D5D5'
export const clr_text_dark = '#353535'
export const clr_btn_bg_root = '#00A9DE'
export const clr_btn_bg_notice = '#e65100'
export const clr_bg_item = '#353535'
export const menu_guest = 'LAPORKAN KE KAMI'
export const menu_babinsa_1 = 'LAPORAN MASYARAKAT'
export const menu_babinsa_2 = 'LAPORKAN KEGIATAN/ KEJADIAN'
export const menu_op_koramil_1 = 'LAPORAN BABINSA'
export const menu_op_koramil_2 = 'AKTIFKAN BABINSA BARU'
export const menu_op_koramil_3 = 'EDIT COVER KORAMIL'
export const menu_op_kodim_1 = 'LAPORAN KORAMIL'
export const menu_op_kodim_2 = 'UPLOAD PDF REKAP HARI INI'
export const menu_op_kodim_3 = 'AKTFIKAN KORAMIL/ DANDIM BARU'
export const menu_dandim_1 = 'HASIL LAPORAN HARI INI'
export const menu_dandim_2 = 'HASIL LAPORAN BABINSA'
export const menu_dandim_3 = 'AKTIFKAN OP KODIM BARU'
export const level_guest = 6
export const level_babinsa = 5
export const level_op_koramil = 4
export const level_op_kodim = 3
export const level_dandim = 2
export const level_developer = 1
export const backHandlerHome = (props) => BackHandler.addEventListener('hardwareBackPress', () => {
  Alert.alert('Batal', 'Anda yakin membatalkan tahapan ini?', [
    {text: 'ya', onPress: () => {
      props.navigation.navigate('LoginScreen')
      signOut()
    }}
  ], {cancelable: true})
  return true
})

 // reCreate office file ~> constants.wilayah.map(x => {  //      let task = constants.dbRef('office').doc()  //         task.set(x)  //      })
export const wilayah = [
  {
    'nama': 'Kodim 0307/ Tanah Datar',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Kel. Silaing Bawah',
      'Kel. Silaing Bawah',
      'Kel. Pasar Usang',
      'Kel. Tanah Hitam',
      'Kel. Pasar Baru',
      'Kel. Bukit Surungan',
      'Kel. Balai-Balai',
      'Kel. Koto Panjang',
      'Kel. Koto Katik',
      'Kel. Ngalau',
      'Kel. Ekor Lubuk',
      'Kel. Sigando'
    ]
  },
  {
    'nama': 'Koramil 01/ Padang panjang',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Kel. Silaing Bawah',
      'Kel. Silaing Bawah',
      'Kel. Pasar Usang',
      'Kel. Tanah Hitam',
      'Kel. Pasar Baru',
      'Kel. Bukit Surungan',
      'Kel. Balai-Balai',
      'Kel. Koto Panjang',
      'Kel. Koto Katik',
      'Kel. Ngalau',
      'Kel. Ekor Lubuk',
      'Kel. Sigando'
    ]
  },
  {
    'nama': 'Koramil 02/ Lima Kaum',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Baringin',
      'Nagari Lima Kaum',
      'Nagari Labuah',
      'Nagari Cubadak',
      'Nagari Parambahan',
      'Jrg. Dusun Tuo',
      'Jrg. Kubu Rajo',
      'Jrg. Piliang',
      'Jrg. Tigo Tumpuk',
      'Jrg. Supanjang'
    ]
  },
  {
    'nama': 'Koramil 03/ Pariangan',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Tabek',
      'Jrg. Koto Tuo',
      'Nagari Sungai Jambu',
      'Nagari Batu Basa',
      'Nagari Simabur',
      'Nagari Pariangan',
      'Jrg. Batur',
      'Nagari Sawah Tangah',
      'Jrg. Sikaladi',
      'Jrg. Sawah Tangah',
      'Jrg. Buluh Kasok'
    ]
  },
  {
    'nama': 'Koramil 04/ Lintau Buo',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Jrg. Tanjung Bonai',
      'Nagari Lubuk jantan',
      'Nagari Taluak',
      'Nagari Tigo Jangko',
      'Nagari Balai Tangah',
      'Nagari Buo',
      'Nagari Batu Bulek',
      'Jrg. Lubuk Batang',
      'Nagari Pangian',
      'Jrg. Lubuk Gadang',
      'Nagari Tanjung Bonai'
    ]
  },
  {
    'nama': 'Koramil 05/ X Koto',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Aia Angek',
      'Nagari Koto Laweh',
      'Nagari Singgalang',
      'Nagari Koto Baru',
      'Nagari Panyalaian',
      'Nagari Pandai Sikek',
      'Nagari Jaho',
      'Nagari Paninjauan',
      'Nagari Tambangan',
      'Jrg. Koto Laweh',
      'Jrg. Tigo Suku'
    ]
  },
  {
    'nama':'Koramil 06/ Sungayang',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Baruh Bukik',
      'Nagari Sungayang',
      'Nagari Sungai Patai',
      'Nagari Jrg Balai Gdg',
      'Nagari Jrg Andaleh',
      'Nagari Tanjung',
      'Nagari Minang Kabau',
      'Nagari Andaleh Baruh',
      'Jrg. Sianau Indah',
      'Jrg. Koto Panjang',
      'Jrg. Balai Bungo',
      'Jrg. Badinah Murni'
    ]
  },
  {
    'nama':'Koramil 07/ Rambatan',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Simawang',
      'Nagari Rambatan',
      'Nagari Padang Magek',
      'Nagari Duo Koto',
      'Nagari Balimbing',
      'Jrg. Padang Data',
      'Jrg. Pabalutan',
      'Jrg. Siturah',
      'Jrg. Bukit Tamasu',
      'Jrg. Ombilin'
    ]
  },
  {
    'nama':'Koramil 08/ Batipuh', 
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Batipuh Ateh',
      'Nagari Gunung Rajo',
      'Nagari Batu Taba',
      'Nagari Tanjung Barulak',
      'Nagari Bungo Tanjung',
      'Nagari Sumpur',
      'Nagari Pitalah',
      'Nagari Andaleh',
      'Nagari Sabu',
      'Jrg. Gunung Bungsu',
      'Nagari Batipuh Baruah',
      'Nagari Padang Laweh',
      'Jrg. Kapuh'
    ]
  },
  {
    'nama': 'Koramil 09/ Salimpuang',
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Tabek Patah',
      'Nagari Barulak',
      'Nagari Sumanik',
      'Nagari Supayang',
      'Nagari Situmbuk',
      'Nagari Mandahiling',
      'Nagari Tanjung Alam',
      'Nagari Salimpaung',
      'Jrg. Tarok',
      'Jrg. Koto Alam',
      'Jrg. Piliang'
    ]
  },
  {
    'nama':'Koramil 10/ Sungai Tarab', 
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Koto Baru',
      'Nagari Padang Laweh',
      'Nagari Rao-Rao',
      'Nagari Gurun',
      'Nagari Koto Tuo',
      'Nagari Kumango',
      'Nagari Talang',
      'Nagari Sungai Tarab',
      'Nagari Simpuruik',
      'Jrg. Tigo Batua',
      'Nagari Pasie Laweh'
    ]
  },
  {
    'nama': 'Koramil 11/ Tanjung Emas', 
    'storedToday': false,
    'photoSource': '',
    'admin': {
      'key': '',
      'name': '',
      'telp': ''
    },
    'array': [
      'Nagari Atar',
      'Nagari Pagaruyung',
      'Nagari Padang Ganting',
      'Nagari Saruaso',
      'Nagari Koto Tangah',
      'Nagari Pagaruyung',
      'Nagari Padang Ganting',
      'Nagari Tanjung Barulak',
      'Jrg. Pintu Rayo',
      'Jrg. Balai Janggo',
      'Jrg. Padang Datar'
    ],
  }
]

// export const filterArrayByWeek = {
//   You can use the filter as below to achieve this.

// data.filter((d) => {
//   return new Date(d.date).getTime() >= seventhDay.getTime();
// });
// Here, if your date data type is Date already, you don't need to convert to date again new Date(d.date).

// Also, it will work without getTime() as below.

// return new Date(d.date) >= seventhDay;
// var data=[{'date':'11/20/2016 08:45:58','energy':29940913188,'power':6783,'time':217781102},{'date':'11/25/2016 08:46:01','energy':29940913267,'power':6792,'time':217781105},{'date':'11/25/2016 08:46:02','energy':29940913318,'power':6791,'time':217781107},{'date':'11/25/2016 08:46:04','energy':29940913344,'power':6797,'time':217781108},{'date':'11/25/2016 08:46:05','energy':29940913396,'power':6816,'time':217781110},{'date':'11/25/2016 08:46:07','energy':29940913421,'power':6798,'time':217781111},{'date':'11/21/2016 08:46:08','energy':29940913473,'power':6804,'time':217781113}]

// var seventhDay = new Date();
// seventhDay.setDate(seventhDay.getDate() - 7);

// var filteredData = data.filter((d) => {
//   return new Date(d.date).getTime() >= seventhDay.getTime();
// });

// console.log(filteredData);
// }

export const currentToken = () => {
  let result = new Promise((resolve, reject) => { messaging().hasPermission().then(enabled => {
    if(enabled){
      messaging().getToken().then(token => {
        resolve(token)
      }).catch(err => console.log('perm enable messaging().getToken() err: ', err))
    } else messaging().requestPermission().then((authorized) => {
      if(authorized){ 
        messaging().getToken().then(token => {
          resolve(token)
        }).catch(err => console.log('perm authorized messaging().getToken() err: ', err))
      }else console.log('request permission rejected.')
    }).catch(err => console.log('messaging().requestPermission() err: ', err))
  }).catch(err => console.log('messaging().hasPermission() err: ', err))})
  
  return result
}

export const updateToken = (userObj, newToken) => {
  let usrRef = dbRef('users').doc(userObj.key), //.where('key', '==', userObj.key),
  promise = new Promise((resolve, reject) => firestore().runTransaction( async (transaction) => {
    let doc = await transaction.get(usrRef)
    if (doc.data().deviceToken == null) { 
      transaction.set(usrRef, { deviceToken: [newToken] }, {merge: true})

      resolve(doc.data())
      //console.log([newToken])
    }else {
      if(userObj.deviceToken.includes(newToken)){
        resolve(doc.data())
        
        transaction.set(usrRef, { deviceToken: doc.data().deviceToken }, {merge: true})
        console.log('your new device token was exists.')
      }else{
        let nextOne = doc.data().deviceToken
        nextOne.push(newToken)
      
        transaction.set(usrRef, { deviceToken: nextOne }, {merge: true})
      }
    
      resolve(doc.data())
      //console.log(JSON.stringify('old: ', userObj.deviceToken, 'new: ',newToken))
    }
  }))

  return promise
}

// export const updateTokenBak = (user, newToken) => {
//   let promise = new Promise((resolve, reject) => 
//     dbRef('users').where('key', '==', user.key).get().then(snapshot => {
//       let data = {deviceToken: newToken}, result = {...data, ...user}
      
//       if(!snapshot.empty) {
//         try {
//           PrefModule.apply('key', JSON.stringify(result))
//           snapshot.forEach((snap, idx) => 
//             snap.ref.update({deviceToken: newToken}).then(() => resolve(result)).catch(err => console.log(err))
//           )
//           console.log('new token added.', newToken)
//         } catch (error) {
//           console.log(error)
//         }
//       }
//     })
//   )

//   return promise
// }

export const deleteDbStorage = (path) => {
  let storageRef = firestorage().ref(path), 
    promise = new Promise((resolve, reject) => storageRef.getMetadata().then(() => 
      storageRef.delete().then(deleted => resolve(`${path} berhasil dihapus.`)).catch(err => reject(err))
    ).catch((err) => {
      reject(err)
      console.log(err)
    }))

  return promise
}

export const pushNewArrayItem = () => {
  let testref = dbRef('test').doc('4MlZekFiGC063MDaGzwp')

  firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(testref)
    if (!doc.data().array) { 
      transaction.set(testref, { array: ['perdana'] }, {merge: true}) 
    }else{
      let newOne = doc.data().array
      newOne.push('kedelapan')

      transaction.set(testref, { array: newOne }, {merge: true})
      
      console.log(JSON.stringify(newOne, null, 2))
    }
  }) //.doc('4MlZekFiGC063MDaGzwp').update({array: ['delapan']}).then(() =>  console.log('success')).catch(err => console.log(err)) 
}

// export const testFlat = () => {
//   let data = ['satu']//, ['dua'], 'tiga', 'empat', [['lima']]]

//   console.log(JSON.stringify(data.flat(), null, 2))
// }

export const sendMessage = (params) => {
  let serverKey = 'AAAAadcbWqQ:APA91bH2yK9k9MrEjIvUMPmqFq5GyME6jgW5St9uoQReow1rY39a_zFOZqwii0wLpxExpxitF8mrACma9gqhrKtUK3iywxCKR_iUVUR6VrBSL2-YW36VMk11t-DHpLY-TdBLACX2hob1'
  
  params != null && fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${serverKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(params)
  }).then(val => val.json()).then(resp => console.log(JSON.stringify(params, null, 2))).catch(err => console.log(err))
    
        // notification: { 
        //   title: 'NewsMagazine.com', 
        //   body: `This week's edition is now available.`,
        //   priority: 'high',
        //   image: 'https://firebase.google.com/images/social.png'
        // },
        // apns: {
        //   headers: {
        //     'apns-priority': '5'
        //   }
        // },
        // webpush: {
        //   headers: {
        //     Urgency: 'high'
        //   }
        // },
}

export const dailyUpdate = () => { console.log('daily update attampted')
  functions.https.onRequest((request, response) => {
    console.log('daily update attampted 2') // TODO
  });
  //firebase.functions().httpsCallable
  // firebase.functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  //   console.log('This will be run every 5 minutes!');
  // });
}

export const openingBy = (koramil) => [
  {
    from: 'Babinsa',
    to: `Dandramil ${koramil}`,
    values: [`<h3>Kepada Yth. Dandramil ${koramil}</h3><br /><br /><h5>WANWIL<br />UPSUS</h5>`]
  },
  {
    from: 'Koramil',
    to: `Dandim 0307/ Tanah Datar`,
    values: [`<h3>Kepada Yth. Dandim 0307/Tanah Datar</h3><br /><br /><h5>WANWIL<br />UPSUS</h5>`]
  },
  {
    from: 'Kodim',
    to: `Danrem 032/Wirabraja`,
    values: [
      `<h3>Kepada Yth. Danrem 032/Wirabraja</h3> <br /><br /><li>Cc.</li><br /> <li>1. Aster Kasdam I/Bukit Barisan</li><br /> <li>2. Kasiterrem 032/Wirabraja</li>`]
  },
]

export const loopArray = (array) => {
  let result = ''
  for (let i = 0; i < array.length; i++) {
    result += `${array[i]},`
  }

  return result
}

export const loopinglist = (string, size) => {
  let result = ''
  for (let i = 1; i < size; i++) {
    result += `${string} ${i},`
  }

  return result
}

export const parseDate = (timeStamp) => { // yarn add moment to fix
  const event = new Date(timeStamp) //new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  return event.toLocaleDateString('id-ID', options)
}

export const parseMoment = (timeStamp, isfull) => {
  moment.locale('id-ID')
  if(!isfull){
    return moment(timeStamp).fromNow()
  }else {
    return moment(timeStamp).format('dddd, MMMM DD YYYY')
  }
  //return new Date(timeStamp).getTime()//moment("20120620", "YYYYMMDD").fromNow();//
}

export const ImgPickerOpt = {
    title: 'Pilih gambar',
    customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };
export const ImageModule = requireNativeComponent('ImageModule', null)
export const SubmitModule = requireNativeComponent('SubmitModule', null)
export const LocationModule = requireNativeComponent('LocationModule', null)
export const HtmlTextModule = requireNativeComponent('HtmlTextModule', null)
export const PdfModule = requireNativeComponent('PdfModule', null)
export const ImageDetail = requireNativeComponent('ImageDetail', null)
export const { PrefModule, SlideListModule, SlideImageModule, NotificationModule } = NativeModules
export class Header extends Component {
  constructor(){
    super()

    YellowBox.ignoreWarnings(['Warning: DatePickerAndroid has been merged'])
  }
  render(){
    const 
      { navigation, title, isHideBackButton } = this.props.mProps, 
      getTitle = navigation && navigation.getParam('title') ? navigation.getParam('title') : title, 
      navigate = (screen, param) => navigation.navigate(screen, param)

    return(
      <View style={styles.header}>
      <View style={[styles.toolbar, {padding:10}]}>
        <TouchableOpacity activeOpacity={0.5} onPress={()=> { console.log('pop() button pressed.')
          isHideBackButton ? null : navigation.pop()
        }}>
          <Image style={styles.iconbar} source={isHideBackButton ? null : require('../assets/ic_back.png')} resizeMode='contain' />              
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onPress={()=> null}>
          <Image style={styles.iconbar} resizeMode='contain' />
        </TouchableOpacity>
      </View>
      <Text style={styles.welcome}>{getTitle}</Text>
      <View style={styles.welcome_separator}>
        <View style={styles.welcome_separator_empty}></View>
        <View style={styles.welcome_separator_middle}></View>
        <View style={styles.welcome_separator_empty}></View>
      </View>
      </View>
    )
  }
}

export const dbRef = (collection) => firestore().collection(collection)

export const signOut = () => {
  try {
    isDbSignedIn() ? auth().signOut() : null
    PrefModule.apply('key', '')
  } catch (error) {
    alert(error)
  }
}
export const isDbSignedIn = () => {
  auth().currentUser
}

export const formatPhoneNumber = (str) => { // let  //   cleaned = ('' + str).replace(/\D/g, ''), //   result = '';   //Check if the input is of correct length let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  let result = ''

  if (str.slice(0, 1) === '0') {
    result = '+62' + str.slice(1, str.length)
  }else if(str.slice(0, 2) === '62'){
    result = '+' + str
  }else if(str.slice(0, 3) === '+62'){
    result = str
  }else{
    result = '+62' + str.slice(0, 11)
  }

  return result
}

export const mainItem = (title, callback) => 
  <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} onPress={callback}>
    <Text style={styles.btn_normal}>{title}</Text>
  </TouchableOpacity>

export const noticeItem = (title, key, callback) => 
  <TouchableOpacity key={key} activeOpacity={0.9} onPress={callback}>
    <Text style={styles.btn_notice}>{title}</Text>
  </TouchableOpacity>

export const separatorApp = () =>
  <View style={styles.welcome_separator}>
    <View style={styles.welcome_separator_empty}></View>
    <View style={styles.welcome_separator_middle}></View>
    <View style={styles.welcome_separator_empty}></View>
  </View>

export const developerItems = (navigate, user) => (
  <View style={{alignSelf: 'stretch'}}>
    {mainItem(menu_babinsa_1, () => navigate('ReportScreen', {title:menu_babinsa_1}))}
    {mainItem(menu_babinsa_2, () => navigate('SubmitScreen', {title:menu_babinsa_2, user: user, items: {}}))}
    {mainItem(menu_op_koramil_2, () => navigate('ActivateduserScreen', {title:menu_op_koramil_2}))}
    {mainItem(menu_op_koramil_1, () => navigate('ReportScreen', {title:menu_op_koramil_1}))}
    {mainItem(menu_op_kodim_1, () => navigate('ReportScreen', {title:menu_op_kodim_1}))}
    {mainItem(menu_op_kodim_2, () => navigate('PdfviewerScreen', {title:menu_op_kodim_2}))}
    {mainItem(menu_op_kodim_3, () => navigate('ActivateduserScreen', {title:menu_op_kodim_3}))}
    {mainItem(menu_dandim_1, () => null)}
    {mainItem(menu_dandim_2, () => navigate('ReportScreen', {title:menu_dandim_2}))}
    {mainItem(menu_dandim_3, () => navigate('ActivateduserScreen', {title: menu_dandim_3}))}
    {mainItem(menu_guest, () => navigate('SnapsendScreen', {title:menu_guest}))}
  </View>
)

export const openDatePicker = () => {
  let promise = new Promise((resolve, reject) => {
    DatePickerAndroid.open({'mode': 'calendar'}).then(value => {
      let {day, month, year, action} = value
      switch (action) {
        case DatePickerAndroid.dateSetAction:
          resolve(`${day}-${month+1}-${year}`)
          break;
        case DatePickerAndroid.dismissedAction:
          reject('canceled.')
          break;
        default:
          reject('failed.') 
        break;
      }
    })
  })
  
  return promise
}

export const itemPlaceHolder = () => {
  let xStyle = {backgroundColor: clr_placeholder, color: clr_placeholder}

return(
<View style={styles.container}>
  <View style={styles.header}>
    <View style={styles.toolbar}>
      <View>
        <Image style={styles.iconbar} resizeMode="contain" />
      </View>
      <View activeOpacity={0.5}></View>
    </View>
    <Text style={[styles.welcome, xStyle]}>Selamat Datang</Text>
    <View style={styles.welcome_separator}>
      <View style={styles.welcome_separator_empty}></View>
      <View style={[styles.welcome_separator_middle, xStyle]}></View>
      <View style={styles.welcome_separator_empty}></View>
    </View>
    <View style={{height:20}} />
  </View>
  <Text style={[styles.page_title, {marginBottom:5}]}></Text>
  <View style={styles.header}>
    <View style={{alignSelf: 'stretch'}}>
    <View style={[styles.btn_toucher, xStyle, {height:50}]}></View>
    </View>
  </View>
  <View style={styles.body}>
    <View style={[styles.user_box, xStyle, {height:185}]}></View>
    <View style={[styles.item_box, xStyle]}>
      <View style={styles.item_box_left}></View>
      <View style={styles.item_box_right}></View>
    </View>
  </View>
</View>
)}

export const progress = () => <View style={{alignSelf: 'stretch'}}><ActivityIndicator style={{alignSelf:'center', width:35, height: 35, margin: 10}} /></View>

/*
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// usage example:
var a = ['a', 1, 'a', 2, '1'];
var unique = a.filter( onlyUnique ); // returns ['a', 1, 2, '1']
*/

/*
let ibx = [], arr = ['bar', 'foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz'],
counts = arr.reduce((start, end) => {
    start[end] = (start[end] || 0) + 1 // <~ this line give count of value
    
    return start
}, {}) // < this bracket give object return
//, rsl = Object.entries(counts)
//counts
let extract = Object.entries(counts)

//const map = new Map(Object.entries(counts));
Object.entries(counts).forEach(([key, value], idx) => { 
    ibx.push({key, value})
})

let done = ibx //.filter(x => x.key == 'bar')

// let maxCount = Math.max(...Object.values(counts));
// let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);

counts
*/

/*
` <constants.HtmlTextModule 
              style={ this.identifyUsr('post_babinsa') 
                ? { flex:1, alignSelf: 'stretch', height: pageSingle } // : this.identifyUsr('post_kodim')  // ? { flex:1, alignSelf: 'stretch', height: idx == 0 ? pageLength == 1 ? pageSingle : (pageLength +1) * pageHi : (pageLength +1) * pageHi }
                : { flex:1, alignSelf: 'stretch', height: idx == 0 ? article.length == 1 ? pageSingle : (article.length+1) * pageHi : (article.length+1) * pagelow }
              }
              apply={`
                <!DOCTYPE html>
                <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <meta http-equiv='X-UA-Compatible' content='ie=edge'>
                    <title></title>
                </head>
                <body>
                ${
                  idx == 0 ? `
                    No. Surat xx/xx/xx/xx<br /><br />
                    ${art.posts.opening} <br /><br />
                    Selamat siang komandan, ijin melaporkan ${art.posts.kasus} Jajaran Wilayah ${art.by.kesatuan}, ${art.posts.kasusName} pada hari ${constants.parseDate(art.posts.creationTime)} sbb:
                  ` : ''
                }
                ${
                  art.by.kesatuan.includes('Koramil')
                  ? `<h5>${idx+1}. Babinsa ${art.by.name}</h5>`
                  : `<h5>${idx+1}. ${art.by.kesatuan}</h5>`
                }
                    <li>a. ${art.posts.kasus}</li><br />

                    <li>b. Babinsa ${art.by.kesatuan} </li><br />
                    <li>${art.by.name} melaksanakan ${art.posts.kasus == 'kejadian' ? 'tindakan evakuasi' : ''} ${art.posts.kasusName}..</li><br /><br />
                    - Nagari: ${art.posts.nagari}<br />
                    - Kec: ${art.posts.kecamatan}<br />
                ${
                  art.posts.type == 'kegiatan/panen'
                  ? ` 
                    - Poktan: ${art.posts.poktan}<br />
                    - Ketua poktan: ${art.posts.ketuaPoktan}<br />
                    - Pemilik Sawah: ${art.posts.pemilikLahan}<br />
                    - Varietas: ${art.posts.varitas}<br />
                    - Luas: ${art.posts.luas}
                    `
                  : art.posts.type == 'kejadian/umum'
                  ? `
                    - Kerusakan: ${art.posts.kerusakan}<br />
                    - Korban: ${art.posts.korban}
                    `
                  : ``
                }
                    <br />
                    - Bantuan: ${art.posts.bantuan}<br />
                    <br />

                    ${art.posts.captions}<br /><br />

                    ${!art.by.kesatuan.toLowerCase().includes('Koramil'.toLowerCase()) ? 'Tembusan<br /><br /> 1. Kasdim 0307/ Tanah Datar<br />2. Para pasi dim 0307/ Tanah Datar' : ''}
                
                    <!--<p>Demikian dilaporkan selanjutnya mohon petunjuk.</p>-->
                </body>
                </html>
                `}/>               `
*/