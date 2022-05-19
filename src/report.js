/**
 * Sample React Native App
 * https://github.com/facebook/react-native 
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, TextInput, Text, View, ScrollView, Image, TouchableOpacity, Alert} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      snapData: null,
      inbox: [],
      selectedPage: 0,
      query: '',
      selectedDate: ''
    }
  }

  nav = () => this.props.navigation

  onParam = (idx) => {
    let params = ['items', 'state', 'title']

    return this.nav().getParam(params[idx])
  }

  isDandim = () => this.onParam(2) === constants.menu_dandim_2

  isOpKodim = () => this.onParam(2) === constants.menu_op_kodim_1

  isOpKoramil = () => this.onParam(2) === constants.menu_op_koramil_1
  
  isBabinsa = () => this.onParam(2) === constants.menu_babinsa_1
  
  componentDidMount = () => { //console.log(this.onParam(2))
    this.onSnapDatabase()
  }

  componentWillUnmount = () => {
    this.postListener()
  }

  onSnapDatabase = () => {
    this.postListener = this.isOpKoramil() ? constants.dbRef('post_babinsa').onSnapshot(this.onPostUpdate)
    : this.isOpKodim() ? constants.dbRef('post_koramil').onSnapshot(this.onPostUpdate)
    : this.isDandim() ? constants.dbRef('post_kodim').onSnapshot(this.onPostUpdate)
    : constants.dbRef('post_masyarakat').onSnapshot(this.onPostUpdate)
  }
  
  onPostUpdate = (snapData) => {  let inbox = [], {selectedPage, selectedDate, query} = this.state
    snapData != null && snapData.forEach((values, keys) => {
      values.exists 
      ? inbox.push(values.data())
      : console.log('val down not exist')
    })

      /* DANDIM */
    let data = this.isDandim() ? inbox.filter(x => selectedPage == 0 ? !x.expired : x.expired)

      /* OP KODIM */
      : this.isOpKodim() ? inbox.filter(x => selectedPage == 0 ? !x.expired : x.expired)
      
      /* OP KORAMIL */
      : this.isOpKoramil() 
        ? inbox.filter(x => x.by.kesatuan == this.onParam(1).user.kesatuan).filter(x => selectedPage == 0 ? !x.posts.expired : x.posts.expired) //.filter(xNtf => !xNtf.read && xNtf.targets.includes(this.user().key))
        
      /* BABINSA */
      : this.isBabinsa() ? selectedPage == 0 
        ? inbox.filter(x => x.targets.includes(this.onParam(1).user.key)) 
        : inbox
      : [] // : inbox.filter(x => x.by.kesatuan == this.onParam(1).user.kesatuan) //     .filter(x => x.targets.includes(this.onParam(1).user.key)) //.filter(xNtf => !xNtf.read && xNtf.targets.includes(this.user().key)) //     .filter(x => selectedPage == 0 ? !x.posts.expired : x.posts.expired)
      
    let 
      sortedData = data.sort((a, b) => b.creationTime - a.creationTime),
      filteredData = this.onParam(0) != null 
        ? this.onParam(0).key != null 
          ? sortedData.filter(x => x.key == this.onParam(0).key) 
          : [] 
        : sortedData,
      focustedData = selectedDate.length 
        ? filteredData.filter(x => 
            new Date(x.creationTime).getDate() == selectedDate.split('-')[0] &&
            new Date(x.creationTime).getMonth()+1 == selectedDate.split('-')[1] &&
            new Date(x.creationTime).getFullYear() == selectedDate.split('-')[2]
          )
        : filteredData,
      queringData = focustedData.filter(x => (x.by?.telp?.includes(query) || x.by?.name.includes(query)))

    this.setState({ inbox: queringData, snapData }) // console.log(JSON.stringify('queringData '+ queringData.length, null, 2))
  }

  pages = () => { let result = []
    if(this.isOpKodim() || this.isOpKoramil()) {
      result = [require('./assets/inbox.png'), require('./assets/done.png')]
    }else if(this.isDandim()){
      result = [require('./assets/inbox.png')]
    }else if(this.isBabinsa()){
      result = [require('./assets/lock.png'), require('./assets/inbox.png')]
    }
  
    return result
  }

  render() {
    let {inbox, selectedDate, selectedPage, snapData} = this.state
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <constants.Header mProps={this.props} />
          <View style={{height:45}} />
          <View style={styles.body}>
            <View style={{alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
            { this.pages().map((flipImage, i) => 
                <TouchableOpacity key={i} activeOpacity={0.7} style={{backgroundColor: selectedPage == i ? constants.clr_btn_bg_root : constants.clr_bg_item, padding:10, flexDirection:'row'}} onPress={() => this.setState({ selectedPage: i }, () => this.onPostUpdate(snapData))}>
                  <Image style={{width:25, height: 25, tintColor: constants.clr_light}} source={flipImage}></Image>
                </TouchableOpacity>) }
              </View>
              <TouchableOpacity activeOpacity={0.7} style={{backgroundColor: constants.clr_bg_item, borderColor: constants.clr_btn_bg_root, borderWidth: 2.5, padding:10, flexDirection:'row', alignSelf:'flex-end'}} onPress={() => 
                constants.openDatePicker().then((val) => this.setState({selectedDate: val}, () => this.onPostUpdate(this.state.snapData))).catch(err => console.log(err))
              }>
                <Text style={{alignSelf: 'center'}}>{selectedDate.length ? `${selectedDate} `: ''}</Text>
                <Image style={{width:25, height: 25}} source={require('./assets/calender.png')}></Image>
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.inp_tx_normal, {marginVertical:5}]} placeholder="Cari Nama / No. telp" onChange={e => this.setState({query: e.nativeEvent.text}, () => this.onPostUpdate(snapData))}/>
          <Text style={styles.page_title}>
          { 
            inbox.length > 0 ? selectedPage == 0 ? 'LAPORAN UNTUK ANDA' : this.isBabinsa() ? 'SEMUA LAPORAN MASYARAKAT' : 'LAPORAN TERKIRIM' : this.isBabinsa() ? 'LAPORAN UNTUK ANDA'
            : this.onParam(1).isKoramilSent ? 'Rekap sudah terkirim'.toUpperCase()
            : 'belum ada laporan'.toUpperCase()
          }
          </Text>
        {
          inbox.length > 0 ? inbox.map((x, i) => 
            <View key={i} style={styles.item_box}>
                <TouchableOpacity style={styles.item_box_left} onPress={() => this.nav().navigate('ImagePreviewScreen', {preview: x.photoSource.url})}>
                  <Image style={{width:'100%', height: '100%'}} resizeMode="cover" source={{uri: x.photoSource.url}}></Image>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item_box_right} activeOpacity={0.5} onPress={() =>
                  this.nav().navigate('ArticleScreen', {state: this.onParam(1), item: {
                    relatedDoc: {
                      title: this.onParam(2) == constants.menu_op_koramil_1 ? 'post_babinsa'
                        : this.isOpKodim() ? 'post_koramil'
                        : this.isDandim() ? 'post_kodim'
                        : 'post_masyarakat',
                      key: this.isOpKodim() ? x.relatedDoc.postedToday
                        : this.isDandim() ? x.relatedDoc.postedToday
                        : x.key
                    }
                  }})
                } onLongPress={() => { 
                  this.isBabinsa() ? Alert.alert('Hapus', `Anda akan menghapus laporan ${x.kasus} ${x.by.kesatuan} oleh ${this.isBabinsa() ? x.by.telp : x.by.name}?`, [{text:'Setuju', onPress: () => {
                    let tasks = [{table:'notifications', key: x.by.keyNtf}, {table:'post_masyarakat', key: x.key}] //console.log(keyNtf)
                    
                    tasks.map((x, i) => 
                      constants.dbRef(x.table).doc(x.key).delete().then(() => alert('berhasil data terhapus')).catch(err => console.log(err))
                    ) //&& constants.deleteDbStorage(`images/${x.photoSource.path}`).then(deleted => console.log('file deleted.')).catch(err => {})
                  }}], {cancelable:true}) : null
                }}>
                  <View style={styles.item_box_right_body}>
                    <Text style={styles.item_box_tx_label}>{!this.isBabinsa() ? x.by.kesatuan : x.by.telp}</Text>
                    <Text style={styles.item_box_tx_body}>{ x.posts != null 
                    ? x.posts.captions.substr(0, 30)+' ...' 
                    : this.isOpKodim() 
                    ? `${x.by.name} melaporkan ${x.relatedDoc.postedToday.length} kegiatan anggota babinsa hari ini`.slice(0, 34)+'..'
                    : this.isDandim() 
                    ? `${x.by.name} melaporkan ${x.relatedDoc.postedToday.length} koramil berkegiatan hari ini`.slice(0, 34)+'..'
                    : this.isBabinsa() ? x.captions.slice(0, 34)+'..'
                    : ''}</Text>
                  </View>
                  <Text style={styles.item_box_tx_footer}>{constants.parseMoment(x.creationTime)}</Text>
                </TouchableOpacity>
              </View>
            )
          : this.onParam(1).isKoramilSent
          ? null
          : [0,0,0].map((x, i) => <View key={i} style={[styles.item_box, {backgroundColor: constants.clr_bg_item}]} activeOpacity={0.5}></View>)
        }
          </View>
        </View>
      </ScrollView>
    );
  }
}

// {
//   let 
//     listInit = [constants.menu_op_koramil_1, constants.menu_op_kodim_1, constants.menu_dandim_2, constants.menu_babinsa_1],
//     listParam = ['post_babinsa', 'post_koramil', 'post_kodim', 'post_masyarakat'],
//     titleFor = (i) => this.onParam(2) === listInit[i]

//   this.nav().navigate('ArticleScreen', {state: this.onParam(1), item:{ relatedDoc:{
//     title: titleFor(0) ? listParam[0] //'post_babinsa'
//       : titleFor(1) ? listParam[1] //'post_koramil'
//       : titleFor(2) ? listParam[2] //'post_kodim'
//       : 'post_masyarakat',
//     key: this.isOpKodim()
//       ? x.relatedDoc.postedToday
//       : x.key
//   }}})
// }