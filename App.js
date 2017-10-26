/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  BleManager
} from 'react-native-ble-plx';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {

  componentWillMount() {
    this.manager = new BleManager({
      restoreStateIdentifier: 'testBleBackgroundMode',
      restoreStateFunction: bleRestoreState => {
        // alert('restored state');
      }
    });
    // this.subscriptions = {};
    this.manager.onStateChange((newState) => {
      alert("State changed: " + newState)

      if (newState === 'PoweredOn') {
        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            return;
          } else {
            // alert(`Found ${device.name}`);
          }
        });
      }
    });
    // const subscription = this.manager.onStateChange((state) => {
    //   if (state === 'PoweredOn') {
    //       this.scanAndConnect();
    //       subscription.remove();
    //       alert('BLE is powered on');
    //   }
    // }, true);
    
  }

  componentWillUnmount() {
    this.manager.destroy();
    delete this.manager;
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native3!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
