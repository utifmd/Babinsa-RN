import React, { Component } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./design/styles";
import * as constants from '../src/utils/constants';

export default class ImagePreview extends Component{
    constructor(){
        super()
        this.state = {
            url: ''
        }
    }

    componentDidMount = () => {
        this.setState({url: this.props.navigation.getParam('preview')}, () => console.log(this.state.url))
    }

    render(){
        let { url } = this.state

        return(
            <View style={styles.container}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => this.props.navigation.pop()} style={{padding: 16}}>
                    <Image resizeMode="contain" source={require('./assets/ic_back.png')} style={styles.iconbar} />
                </TouchableOpacity>
                <constants.ImageDetail style={[styles.article_header, {flex:1}]} load={url} />
            </View>
        )
    }
}