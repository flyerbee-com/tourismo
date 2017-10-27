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

import _ from 'underscore';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {

  state = {
    closest_beacon: null
  };

  componentWillMount() {
    this.manager = new BleManager({
      restoreStateIdentifier: 'testBleBackgroundMode',
      restoreStateFunction: bleRestoreState => {
      }
    });
    this.manager.onStateChange((newState) => {

      if (newState === 'PoweredOn') {
        const supported_beacons = [
          'abeacon_B8B1',
          'abeacon_B8B0',
          'abeacon_B8B2',
          'abeacon_B8FB',
        ];

        let detected_supported_beacons = {};

        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            return;
          } else {
            if (_.contains(supported_beacons, device.name)) {
              detected_supported_beacons[device.name] = device.rssi;
            }

            setInterval(() => {
              let conv1 = _.pairs(detected_supported_beacons);
              // console.log(JSON.stringify(conv1));
              let conv2 = _.map(conv1, (item) => {
                const obj = {};
                // obj[item[0]] = item[1];
                obj['name'] = item[0];
                obj['rssi'] = item[1];
                return obj;
              });
              let conv3 = _.sortBy(conv2, 'rssi');
              this.setState({closest_beacon: _.last(conv3).name});
            }, 3000);
          }
        });
      }
    });    
  }

  componentWillUnmount() {
    this.manager.destroy();
    delete this.manager;
  }

  render() {
    let {closest_beacon} = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {closest_beacon}
        </Text>
        { closest_beacon && <Text>is the closest beacon</Text> }
        { closest_beacon === null && <Text>loading the unexpected ...</Text> }
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
