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
  View,
  Image
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

  constructor() {
    super()
    this.state = {
      closest_beacon: null
    };
  }

  componentWillMount() {
    let detected_supported_beacons = new Map();
    let supported_beacons = new Set();

    fetch("http://directus.phy.one/api/1.1/tables/beacons/rows?access_token=xI2ZIGDw8rU7dgB59V15CQDmlPW5HXeT")
      .catch(err => console.log("error fetching " + err))
      .then(res => { Array.from(JSON.parse(res._bodyInit).data).forEach(b => supported_beacons.add(b.beacon_name)) })

    this.manager = new BleManager({
      restoreStateIdentifier: 'testBleBackgroundMode',
      restoreStateFunction: bleRestoreState => {
      }
    });
    this.manager.onStateChange((newState) => {

      if (newState === 'PoweredOn') {
        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) return
          if (supported_beacons.has(device.name) && device != null && device.name != null) {
            detected_supported_beacons.set(device.name, device)
            console.log("received signal from " + device.name)
          }
        });

        setInterval(() => {
          detected_supported_beacons.forEach((value, key) => {
            console.log(key, value.rssi);
          });
          console.log("===========")
          const sorted = Array.from(detected_supported_beacons.values()).sort((a, b) => a.rssi < b.rssi)
          const closest = sorted[0]

          fetch("http://directus.phy.one/api/1.1/tables/beacons/rows?access_token=xI2ZIGDw8rU7dgB59V15CQDmlPW5HXeT")
            .catch(err => console.log("error fetching " + err))
            .then(res => {
              if (closest && closest.name) {
                const contents = JSON.parse(res._bodyInit).data
                const filtered = Array.from(contents).filter(b => b.beacon_name == closest.name)
                const theBeacon = filtered[0]
                this.setState({ closest_beacon: theBeacon })
              }
            })


        }, 3000);
      }
    });
  }

  componentWillUnmount() {
    this.manager.destroy();
    delete this.manager;
  }

  render() {
    let { closest_beacon } = this.state;
    if (closest_beacon != null) {
      let img = null
      if (closest_beacon.image != null) img = (<Image
        style={{
          alignSelf: 'center',
          height: 150,
          width: 150,
          borderWidth: 1,
          borderRadius: 75
        }}
        source={{ uri: 'http://directus.phy.one' + closest_beacon.image.data.url }} resizeMode="contain"
      />)

      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>
            {closest_beacon.title}
          </Text>
          {img}
          <Text>
            {closest_beacon.description}
          </Text>
          <Text>
            {closest_beacon.beacon}
          </Text>

        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>
            loading the unexpected ...
        </Text>
        </View>
      )
    }
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
