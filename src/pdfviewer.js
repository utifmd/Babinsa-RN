/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import {Platform, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, TextInput, requireNativeComponent} from 'react-native'
import styles from './design/styles'
import * as constants from './utils/constants'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      isJenisLaporan: false,
      isNamaKegiatan: false,
      photoSource: {},
    }
  }
  
  render() {
    const 
      { isJenisLaporan, isNamaKegiatan, photoSource } = this.state,
      { navigation } = this.props //, title = navigation.getParam('title'), navigate = (screen, param) => navigation.navigate(screen, param)
      
    return (
      <ScrollView style={{flex:1, backgroundColor: constants.clr_bg_root}}>
        <constants.Header mProps={this.props} />
        <constants.PdfModule style={styles.article_header} />
        <View style={[styles.map_box, {margin: 15}]}></View>
        <View style={styles.header}>
          <TextInput style={[styles.inp_tx_normal, {marginBottom: 10}]} placeholder="Keterangan" keyboardType="default"/>
          <TouchableOpacity style={styles.btn_toucher} activeOpacity={0.5}>
            <Text style={styles.btn_normal}>Kirim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}