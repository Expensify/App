/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';
import _ from 'lodash';

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

/*const array = new Array(1e4).fill(null).map(() => ({a: 5}));

function measure(fun) {
  const before = performance.now();
  for (let i = 0; i < 100; ++i) {
    fun();
  }
  const after = performance.now();
  return after - before;
}

console.log('bbb lodash', measure(() => { 
  let x = 0;
  _.each(array, (i) => { x += i.a});
}));

console.log('bbb forEach', measure(() => { 
  let x = 0;
  array.forEach((i) => { x += i.a}); 
}));*/
