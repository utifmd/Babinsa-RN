import {Platform, StyleSheet, Text, View} from 'react-native';
import * as constants from '../utils/constants'

export default styles = StyleSheet.create({
  /*exclusive for articleview*/
  div: {color: constants.clr_text_dark, backgroundColor: '#ffffff'},
  h1: {fontSize:28, textTransform:'uppercase', fontWeight: 'bold'},
  h2: {fontSize:24, textTransform:'uppercase', fontWeight: 'bold'},
  h3: {fontSize:21, textTransform:'uppercase', fontWeight: 'bold'},
  h4: {fontSize:18, textTransform:'uppercase', fontWeight: 'bold'},
  h5: {fontSize:16, textTransform:'uppercase', fontWeight: 'bold'}, 
  li: {fontSize:14}, 
  p: {fontSize:14},
  a: {fontSize:14},
  b: {fontWeight: 'bold'},
  
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: constants.clr_bg_root,
    //backgroundColor: '#F5FCFF'
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    padding:10
  },
  article_header: {alignSelf: 'stretch', height: 320, marginBottom: 10},
  article_title: {fontSize: 18, color: '#343434'},
  article_author: {fontSize: 15, color: '#484848', fontStyle: 'italic'},
  toolbar: {alignSelf: 'stretch', alignContent: 'space-between', justifyContent:'space-between', flexDirection:'row'},
  iconbar: {width:15, height:15, padding:10},
  body: {padding: 10, paddingTop: -10},
  welcome: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  welcome_separator: {flex:1, flexDirection: 'row', height:3, alignSelf:'stretch'},
  welcome_separator_middle: {flex:0.4, backgroundColor: constants.clr_btn_bg_root},
  welcome_separator_empty: {flex:0.3},
  instructions: {
    textAlign: 'center',
    marginBottom: 5,
  },
  btn_normal: {
    backgroundColor: constants.clr_btn_bg_root,
    fontWeight: 'bold',
    fontSize: 16,
    padding: 15,
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  btn_notice: {
    borderColor: constants.clr_light,
    backgroundColor: constants.clr_btn_bg_notice,
    borderLeftWidth: 5,
    fontSize: 14,
    padding: 10,
    marginVertical: 5,
    alignSelf: 'stretch',
    textAlign: 'left'
  },
  btn_toucher: {alignSelf:'stretch', marginBottom: 10},
  inp_container: {alignSelf: 'stretch', flexDirection: 'row', flex: 1},
  inp_tx_normal: {
    backgroundColor: constants.clr_bg_item,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 3,
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  inp_tx_light: {
    backgroundColor: constants.clr_btn_bg_root,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 3,
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  user_box: {
    backgroundColor: constants.clr_light,
    padding: 15,
    marginBottom: 20,
    alignSelf: 'stretch'
  },
  user_box_ava:{
    backgroundColor: constants.clr_placeholder,
    height: 65,
    width: 65,
    borderRadius: 65,
    marginTop: 10,
    alignSelf: 'center'
  },
  user_box_title: {
    fontSize: 20, color: constants.clr_btn_bg_root, alignSelf: 'center'
  },
  user_box_label: {
    fontSize: 11, color: constants.clr_text_dark, fontWeight:'bold'
  },
  user_box_caption: {
    fontSize: 11, color: '#666666', fontStyle: 'italic', alignSelf: 'center'
  },
  map_box: {
    alignSelf: 'stretch', flexDirection:'row', alignItems: 'center', height: 116, backgroundColor: constants.clr_btn_bg_root, marginBottom:10, marginTop:5, justifyContent: 'center'  },
  item_box: {
    alignSelf: 'stretch',
    marginTop:10,
    height: 120,
    flex:1, 
    flexDirection: 'row',
    backgroundColor: constants.clr_bg_item
  },
  item_box_left: { flex: 0.4, backgroundColor: constants.clr_placeholder},
  item_box_right: {flex: 0.6, padding: 10},
  item_box_right_body: {flex: 0.8},
  item_box_tx_label: {fontSize: 12},
  item_box_tx_body: {fontSize: 15, color: constants.clr_light},
  item_box_tx_footer: {flex:0.2, fontSize: 11, color: constants.clr_btn_bg_root},
  page_title: {fontSize: 16, fontWeight: 'bold'},
});