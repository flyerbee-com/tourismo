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

  constructor(){
    super()
    this.state = {
      closest_beacon: null
    };
  }

  componentWillMount() {
    let detected_supported_beacons = new Map();
    this.manager = new BleManager({
      restoreStateIdentifier: 'testBleBackgroundMode',
      restoreStateFunction: bleRestoreState => {
      }
    });
    this.manager.onStateChange((newState) => {

      if (newState === 'PoweredOn') {
        const supported_beacons = new Set([
          'abeacon_B8B1',
          'abeacon_B8B0',
          'abeacon_B8B2',
          'abeacon_B8FB',
        ]);

        this.manager.startDeviceScan(null, null, (error, device) => {
          if(error) return
          if(supported_beacons.has(device.name)) detected_supported_beacons.set(device.name, device)
        });

        setInterval(() => {
          const sorted = Array.from(detected_supported_beacons.values()).sort((a, b) => a.rssi < b.rssi)
          const closest = sorted[0]

          fetch("http://directus.phy.one/api/1.1/tables/beacons/rows?access_token=xI2ZIGDw8rU7dgB59V15CQDmlPW5HXeT")
          .catch(err => console.log("error fetching " + err))
          .then(res => {
            const contents = JSON.parse(res._bodyInit).data
            const theBeacon = Array.from(contents).filter(b => b.beacon_name == closest.name)[0]
            this.setState({closest_beacon: theBeacon.title})
          })

          this.setState({closest_beacon: closest.name})
        }, 3000);
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
