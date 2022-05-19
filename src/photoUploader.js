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
      photoSource: '', 
      imgPath: ''
    }

    this.submitListener = null
  }

  componentDidMount = () => { 
    this.submitListener = DeviceEventEmitter.addListener('SubmitModule', this.onUploading)
  }

  componentWillUnmount = () => {
    this.submitListener.remove()
  }

  onParam = (idx) => {
    let params = ['item', 'state', 'title']

    return this.props.navigation.getParam(params[idx])
  }

  onUploading = (val) => { console.log('submitListener called.')
    let {photoSource, isUploaded, isImagePlaced} = val

    val && isImagePlaced != null && this.setState({isImagePlaced})
    
    val && photoSource != null && this.setState({photoSource}, this.onCreateDatabase)
  }
  
  onAttampted = () => { console.log('button submit called.')
    let { loading, isImagePlaced, imgPath } = this.state

    isImagePlaced
    ? this.setState({loading: !loading, imgPath: `post_koramil/${this.onParam(1).user.kesatuan}.png`})
    : alert('Anda belum memilih gambar.')
  }
  
  onCreateDatabase = () => {
    constants.dbRef('office').where('nama', '==', this.onParam(1).user.kesatuan).where('admin.key', '==', this.onParam(1).user.key).get().then(snapshot => {
      !snapshot.empty ? snapshot.forEach((office, idx) => office.ref.update({photoSource: this.state.photoSource}).then(() => this.props.navigation.pop()))
      : console.log('debRef was empty')
    })
  }

  render() {
    const 
      { loading, photoSource, imgPath } = this.state,
      selectionOpt = (key) => key == checkedKasus && {borderWidth:2, borderColor:  constants.clr_btn_bg_root},
      { navigation } = this.props 

    //console.log(wilayah)
    return (
      <ScrollView ref={(ref) => this.scrollView = ref} style={{flex:1, backgroundColor: constants.clr_bg_root}}>
        <constants.Header mProps={this.props} />
        <constants.SubmitModule style={styles.article_header} upload={imgPath} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5} disabled={loading} onPress={this.onAttampted}>
            <Text style={styles.btn_normal}>Unggah</Text>
          </TouchableOpacity>
          { loading && constants.progress() }
        </View>
      </ScrollView>
    );
  }
}