/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Linking, Text, View, ScrollView, Image, TouchableOpacity, Dimensions} from 'react-native'
import ArticleView from 'react-native-htmlview'
import styles from './design/styles'
import * as constants from './utils/constants'
import MainView from './main'
//import {WebView} from 'react-native-webview-autoheight'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      snapData: null,
      snapBabinsa: null,
      article: [],
      baKeys: 0,
      idxCover: 0,
      idxPage: 0
    }
  }

  nav = () => this.props.navigation

  params = (idx) => {
    let params = ['item', 'state']

    return this.nav().getParam(params[idx])
  }
  
  identifyUsr = (key) => {
    let rsl = false
    this.params(0).relatedDoc.title == key
    ? rsl = true
    : rsl = false

    return rsl
  }
  
  componentDidMount = () => { //console.log(JSON.stringify(, null, 2))
    this.onDatabaseListener()
  }

  componentWillUnmount = () => {
    this.onPostsListener()
    this.onBabinsaListener()
    this.onOfficeListener()
  }

  onDatabaseListener = () => {
    this.onOfficeListener = constants.dbRef('office').onSnapshot(this.onOfficeUpdate)
    this.onBabinsaListener = constants.dbRef('post_babinsa').onSnapshot(this.onBabinsaUpdate)
    this.onPostsListener = this.identifyUsr('post_babinsa') ? constants.dbRef('post_babinsa').onSnapshot(this.onPostsUpdate)
      : this.identifyUsr('post_koramil') ? constants.dbRef('post_babinsa').onSnapshot(this.onPostsUpdate)
      : this.identifyUsr('post_kodim') ? constants.dbRef('post_koramil').onSnapshot(this.onPostsUpdate)
      : this.identifyUsr('post_masyarakat') ? constants.dbRef('post_masyarakat').onSnapshot(this.onPostsUpdate)
      : this.identifyUsr('post_global') ? constants.dbRef('post_babinsa').onSnapshot(this.onPostsUpdate)
      : constants.dbRef('post_babinsa').onSnapshot(this.onPostsUpdate)
  }

  onBabinsaUpdate = (snapBabinsa) => this.setState({snapBabinsa})

  onPostsUpdate = (snapData) => { let posts = [], babinsaPosts = [], baKeys = [], result = [], {snapBabinsa, idxPage} = this.state //, {notifTitles} = this.state //, {key, relatedKey, kasus, wilayah, by, creationTime} = this.params(0) // <~ notif params
    snapData.forEach((values, keys) => {
      if(values.exists) posts.push(values.data())//this.params(0).relatedDoc.title == 'post_masyarakat' ? : inbox.push(Object.values(values.data()))
      else console.log('val down not exist')
    })

    snapBabinsa.forEach((values, keys) => {
      babinsaPosts.push(values.data())
    })

    if(this.identifyUsr('post_babinsa') || this.identifyUsr('post_masyarakat')) { // console.log(JSON.stringify(this.params(0).relatedDoc, null, 2))
      
      result = posts.filter(x => x.key == this.params(0).relatedDoc.key)
    }else if(this.identifyUsr('post_global')){
      
      result = posts.filter(x => x.key == this.params(0).relatedDoc.key)
    } if(this.identifyUsr('post_koramil')){ let undeocde = []
      this.params(0).relatedDoc.key.forEach((key, idx) => {
        undeocde.push(posts.filter(x => x.key == key))
      })

      result = undeocde.reduce((str, end) => end.concat(str))
    } else if(this.identifyUsr('post_kodim')){ let koramilPosts = []

      this.params(0).relatedDoc.key.forEach((key, idx) => {
        koramilPosts.push(posts.filter(x => x.key == key).reduce((s, e) => e.concat(s)))
      }) 
      
      let korBaKeys = koramilPosts.map(kpx => kpx.relatedDoc.postedToday) 
      
      korBaKeys[idxPage] != null ? korBaKeys[idxPage].forEach(val => baKeys.push(val)) : korBaKeys[0].forEach(val => baKeys.push(val))
      
      result = babinsaPosts.filter(x => baKeys.indexOf(x.key) >= 0) 
      
      console.log('isxPage: ', idxPage)
    }
    
    this.setState({article: result, baKeys, snapData, idxCover:0}) // 
    //console.log(JSON.stringify(posts, null, 2))
  }

  onOfficeUpdate = (snapshot) => {
    /* let mOffice = []
    !snapshot.empty ? snapshot.forEach((office, index) => {
      mOffice.push(office.data())
    }) : console.log('db ref is empty.')

    let coverOffice = mOffice.length > 0 ? mOffice.filter(x => x.photoSource == )
      : [] */
  }

  render() {
    let {article, idxCover, idxPage, baKeys, snapData} = this.state, pageHi = 125, pagelow = 85, pageSingle = 550

    //console.log(JSON.stringify(article, null, 2))
    return (
      <ScrollView style={{flex:1}}>
    { article.length > 0 &&
        article.map((art, idx) =>
          <View key={idx} style={{backgroundColor: constants.clr_light}}>
          { idx == 0 &&
            <View style={{backgroundColor: constants.clr_light}}>
              <View style={[styles.article_header, {backgroundColor: constants.clr_placeholder}]}>
                <Image style={{width:'100%', height:'100%'}} source={{uri: article[idxCover].photoSource.url}} resizeMode="cover"></Image>
                <View style={[styles.toolbar, {padding:10, position: 'absolute'}]}>
                  <TouchableOpacity activeOpacity={0.5} onPress={() => this.nav().pop()}>
                    <Image style={styles.iconbar} source={require("../src/assets/ic_back.png")} resizeMode="contain" />              
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.5} onPress={()=> null}>
                    <Image style={styles.iconbar} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.map_box, {flex:1, marginHorizontal:15, paddingHorizontal:10}]}>
                <Text style={[styles.article_title, {flex:0.8, color: constants.clr_light}]} 
                  onPress={() => article.length > (idxCover +1) ? this.setState({idxCover: idxCover + 1}) 
                  : this.setState({idxCover: 0})}>{!this.identifyUsr('post_masyarakat') && `Bantuan ${article[idxCover].posts.bantuan} oleh Babinsa ${article[idxCover].by.name}${this.identifyUsr('post_koramil') ? ` (${idxCover+1})` : ''}`}</Text>
              { this.identifyUsr('post_kodim') 
                ? <TouchableOpacity style={{flex:0.2}} 
                    onPress={() => snapData != null ? baKeys.length > idxPage ? this.setState({idxPage: idxPage + 1}, () => this.onPostsUpdate(snapData)) 
                    : this.setState({idxPage: 0}, () => this.onPostsUpdate(snapData))
                  : null}>
                    <Image style={{alignSelf:'center', width:35, tintColor: constants.clr_light}} source={require('./assets/baseline_code_black_48.png')} resizeMode="contain" />
                  </TouchableOpacity>
                : <View style={{flex:0.2}}></View>
              }
              </View>
              <View style={styles.header}>
              { this.identifyUsr('post_masyarakat')
                ? <View style={{padding:10, alignItems: 'center'}}>
                    <Text style={[styles.article_author, {textAlign: 'center'}]}>
                      {`${article[idxCover].by.kesatuan}\n${!this.identifyUsr('post_masyarakat') ? article[idxCover].by.name : article[idxCover].wilayah+' '+article[idxCover].by.telp}`}</Text>
                  </View>
                : this.identifyUsr('post_global') ? null
                : <TouchableOpacity activeOpacity={0.7} style={{padding:10, alignItems: 'center'}} 
                    onPress={() => Linking.openURL(`https://wa.me/${article[idxCover].by.telp.replace('+', '')}`)}>
                    <Image style={{width:54, height: 54, margin:10}} source={require('./assets/wa_icon.png')}></Image>
                    <Text style={[styles.article_author, {textAlign: 'center'}]}>
                      {`${article[idxCover].by.kesatuan}${!this.identifyUsr('post_kodim') ? '\n'+article[idxCover].by.name : ''}`}</Text>
                  </TouchableOpacity>
              }
                <Text style={styles.item_box_tx_footer}>{constants.parseMoment(art.creationTime)}</Text>
              </View>
            </View>
          }
            <View style={{paddingHorizontal: 10, backgroundColor: '#ffffff'}}>
              <constants.separatorApp></constants.separatorApp>
              <Text style={[{color: constants.clr_text_dark}, {marginTop: 25}]}>{(article[0]?.captions || article[0]?.posts.captions+'\n'+`- Nagari: ${article[0]?.posts.nagari}\n- Kec: ${article[0]?.posts.kecamatan}\n- Kerusakan: ${article[0]?.posts.kerusakan}\n- Korban: ${article[0]?.posts.korban}\n- Bantuan: ${article[0]?.posts.bantuan}`)}</Text>
            {
              art.posts != null && !this.identifyUsr('post_masyarakat') && !this.identifyUsr('post_global') &&
              <ArticleView stylesheet={styles} value={`
              <div>
              ${ idx == 0 ? `<br />${this.identifyUsr('post_babinsa') ? `<h3>${constants.openingBy(this.params(1).user.kesatuan)[0].values}</h3>` : this.identifyUsr('post_koramil') ? `<h3>${constants.openingBy('')[1].values}</h3>` :  this.identifyUsr('post_kodim') ? `<h3>${constants.openingBy('')[1].values}</h3>` : '' }<br />Selamat siang komandan, ijin melaporkan ${art.posts.kasus} jajaran Wilayah ${art.by.kesatuan}, ${art.posts.kasusName} pada hari ${constants.parseMoment(art.posts.creationTime, true).toLowerCase()} sebagai berikut:` : ''}
              ${
                art.by.kesatuan.includes('Koramil')
                ? `<br /><h5>${idx+1}. Babinsa ${art.by.name}</h5>`
                : `<br /><h5>${idx+1}. ${art.by.kesatuan}</h5>`
              }<br />A. ${art.posts.kasus.toUpperCase()}<br />B. Babinsa ${art.by.kesatuan}
                  <br />${art.by.name} melaksanakan ${art.posts.kasus == 'kejadian' ? 'tindakan evakuasi' : ''} ${art.posts.kasusName}.. 
              ${
                art.posts.type == 'kegiatan/panen'
                ? `<br />- Nagari: ${art.posts.nagari} <br />- Kec: ${art.posts.kecamatan} <br />- Poktan: ${art.posts.poktan} <br />- Ketua poktan: ${art.posts.ketuaPoktan} <br />- Pemilik Sawah: ${art.posts.pemilikLahan} <br />- Varietas: ${art.posts.varitas} <br />- Luas: ${art.posts.luas} <br />- Bantuan: ${art.posts.bantuan}`
                : art.posts.type == 'kejadian/umum'
                ? `<br />- Nagari: ${art.posts.nagari} <br />- Kec: ${art.posts.kecamatan} <br />- Kerusakan: ${art.posts.kerusakan} <br />- Korban: ${art.posts.korban} <br />- Bantuan: ${art.posts.bantuan}`
                : art.posts.type == 'kegiatan/umum'
                ? `<br />- Nagari: ${art.posts.nagari} <br />- Kec: ${art.posts.kecamatan} <br />- Bantuan: ${art.posts.bantuan}`
                : ``
              }
                  <br />${art.posts.captions}<br />${ this.identifyUsr('post_babinsa') ? '<p>Demikian dilaporkan selanjutnya mohon petunjuk.</p>'
                : this.identifyUsr('post_kodim') ? '<br />Tembusan <br />1. Kasdim 0307/ Tanah Datar <br />2. Para pasi dim 0307/ Tanah Datar'
                : ''
              }
              </div>
              `} />
            }
            { article.length > 0 && this.identifyUsr('post_masyarakat') && article[0].targets.includes(this.params(1)?.user?.key) &&
              <TouchableOpacity style={{alignItems: 'center'}} activeOpacity={0.5} onPress={() => 
                !this.params(1)?.isKoramilSent ? this.nav().navigate('SubmitScreen', {user: this.params(1).user, items: article[0]})
                : alert('Laporan Hari Ini Sidah Ditutup!')
              }>
                <Image style={{width:20, height:20, margin:25, tintColor: constants.clr_btn_bg_root}} source={require("../src/assets/ic_forword.png")} resizeMode="contain" />
              </TouchableOpacity>
            }
            <View style={{height:15}}></View>
            </View>
          
          </View>
        
        )
    }
        {
        //   this.identifyUsr('post_masyarakat') && article.length > 0 && article[0].posts != null &&
        // <View style={[styles.body, {padding:16, marginTop: 35}]}>
        //     <Text style={[styles.article_title, {alignSelf:'center'}]}>{`${article[0].posts.kasusName.toUpperCase()}\n`}</Text>
        //     <Text style={styles.div}>{article[0].posts.captions}</Text>
        //     <Text style={styles.div}> - Nagari {article[0].posts.nagari}</Text>
        //     <Text style={styles.div}> - Kecamatan {article[0].posts.kecamatan}</Text>
        //     <Text style={styles.div}> - Kerusakan {article[0].posts.kerusakan}</Text>
        //     <Text style={styles.div}> - Korban {article[0].posts.korban+'\n'}</Text>
        // </View>
        // // article.captions != null &&
        //     // <TouchableOpacity style={{alignItems: 'center'}} activeOpacity={0.5} onPress={() => this.nav().navigate('SubmitScreen', {user: this.params(1).user, items: article})}>
        //     //   <Image style={{width:25, height:25, margin:25, tintColor: constants.clr_btn_bg_root}} source={require("../src/assets/ic_forword.png")} resizeMode="contain" />
        //     // </TouchableOpacity>
        }
      </ScrollView>
    );
  }
}

