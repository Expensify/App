/**
 * The AsyncStorage provider stores everything in a key/value store by
 * converting the value to a JSON string
 */

 import _ from 'underscore';
 import { QuickSQLite } from 'react-native-quick-sqlite';

 const DB_NAME = 'Expensify-new-db';
QuickSQLite.open(DB_NAME);
//QuickSQLite.execute(DB_NAME, 'DROP TABLE  magic_map ');
 
QuickSQLite.execute(DB_NAME, 'CREATE TABLE IF NOT EXISTS magic_map (record_key TEXT NOT NULL PRIMARY KEY , value JSON NOT NULL);');
 // Do We want to create an index here?

/*try {
  QuickSQLite.execute(DB_NAME, `REPLACE into magic_map (record_key, value) VALUES ("three4", json('{"isOffline":true}'))`);
  console.log('okkkkkkkkkkkkkkkkkkkkk');
  QuickSQLite.execute(DB_NAME, `REPLACE into magic_map (record_key, value) VALUES ("three4", json(?))`, ['{"isOffline":false}']);
  console.log('okkkkkkkkkkkkkkkkkkkkk 2222');
} catch (e) {
  console.error('dupa', e);
}*/

function lightStringify(value) {
  let newValue = value;
  const type = typeof value;
  if (type == 'string' || type == 'boolean' || type == 'number' || newValue == null) {
    newValue = JSON.stringify(value);
  }
  return newValue;
}
 
 const provider = {
     /**
      * Get the value of a given key or return `null` if it's not available in storage
      * @param {String} key
      * @return {Promise<*>}
      */
     getItem(key) {
        console.log('getItem key', key);
         return QuickSQLite.executeAsync(DB_NAME, "SELECT record_key, value from magic_map where record_key=?;", [key]).then(({ rows }) => {
          const res = rows._array[0];
          console.log('aaa getItem', res);
          return res.value;
         });
     },
 
     /**
      * Get multiple key-value pairs for the give array of keys in a batch
      * @param {String[]} keys
      * @return {Promise<Array<[key, value]>>}
      */
     multiGet(keys) { 
      console.log('multi get', keys);
      return QuickSQLite.executeAsync(DB_NAME, `SELECT record_key, value from magic_map where record_key IN (${new Array(keys.length).fill('?').join(',')});`, keys)
        .then(({ rows }) => {
        const res = rows._array.map(row => [row.record_key, row.value]);
        console.log('aaa getItems', res);
        return res;
       });
     },
 
     /**
      * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
      * @param {String} key
      * @param {*} value
      * @return {Promise<void>}
      */
     setItem(key, value) {
        console.log('want to set', key, value);
        return QuickSQLite.executeAsync(DB_NAME, "REPLACE into magic_map (record_key, value) VALUES (?, json(?));", [key, lightStringify(value)]);
     },
 
     /**
      * Stores multiple key-value pairs in a batch
      * @param {Array<[key, value]>} pairs
      * @return {Promise<void>}
      */
     multiSet(pairs) { // maybe just generate array of ? 
      console.log('want to set pairs', pairs);
        return QuickSQLite.executeBatchAsync(DB_NAME, [["REPLACE into magic_map (record_key, value) VALUES (?, json(?))", pairs.map(ele => [ele[0], lightStringify(ele[1])])]]);
     },
 
     /**
      * Multiple merging of existing and new values in a batch
      * @param {Array<[key, value]>} pairs
      * @return {Promise<void>}
      */
     multiMerge(pairs) {
      console.log('want to merge pairs', pairs);
        return QuickSQLite.executeBatchAsync(DB_NAME, [["INSERT into magic_map (record_key, value) VALUES (?, json(?)) ON CONFLICT DO UPDATE SET value = json_patch(value, json(?));", pairs.map(ele => [ele[0], lightStringify(ele[1]), lightStringify(ele[1])])]]);
         //return db.multiMerge('magic_map', 'record_key', 'value', pairs);
     },
 
     /**
      * Returns all keys available in storage
      * @returns {Promise<String[]>}
      */
     getAllKeys: () => {
      console.log('getAllKeys SQLiteStorage');
      return QuickSQLite.executeAsync(DB_NAME, "SELECT record_key from magic_map;").then(({ rows }) => {
        const res = rows._array.map(row => row.record_key);
        console.log('getAllKeys response', res);
        return res;
       });
     },
 
     /**
      * Remove given key and it's value from storage
      * @param {String} key
      * @returns {Promise<void>}
      */
     removeItem: (key) => { return QuickSQLite.executeAsync(DB_NAME, "DELETE FROM magic_map where record_key=?;", [key])},
 
     /**
      * Clear absolutely everything from storager
      * @returns {Promise<void>}
      */
     clear: () => {
      return QuickSQLite.executeAsync(DB_NAME, "DELETE FROM magic_map ;", []);
     },
 };
 
 export default provider;

 const shouldTest = false;

 if (shouldTest) {
  const Storage = provider;
  async function test() {
    await Storage.clear();
  
    console.log('cleared');
  
    await Storage.setItem('ba', 'ba');
    const ba = await Storage.getItem('ba');
    if (ba === 'ba') {
        console.log('ok1');
    } else {
        console.log('no1');
    }
  
    await Storage.setItem('ab', 5);
    const ab = await Storage.getItem('ab');
    if (ab === 5) {
        console.log('ok2');
    } else {
        console.log('no2');
    }
  
    await Storage.setItem('bb', null);
    const bb = await Storage.getItem('bb');
    if (bb === null) {
        console.log('ok3');
    } else {
        console.log('no3');
    }
  
    const arr = ['a', 'b', 'c', { a: 4 }];
    await Storage.setItem('aa', arr);
    const aa = await Storage.getItem('aa');
    if (aa[0] === 'a' && aa[3].a === 4) {
        console.log('ok4');
    } else {
        console.log('no4');
    }
  
    const obj = {a: ['a', 'b', 'c', { a: 4 }]};
    await Storage.setItem('aab', obj);
    const aab = await Storage.getItem('aab');
    if (aab.a[0] === 'a' && aab.a[3].a === 4) {
        console.log('ok5');
    } else {
        console.log('no5');
    }
  
    console.log('all keys', await Storage.getAllKeys());
  
    await Storage.removeItem('aa');
  
    const allKeys = await Storage.getAllKeys();
  
    console.log('all keys 2', allKeys);
  
    console.log('getKeys', await Storage.multiGet(allKeys));
  
    await Storage.multiSet(allKeys.map(ele => [ele, {'a': 3}]));
  
    console.log('getKeys 2', await Storage.multiGet(allKeys));
  
    await Storage.multiMerge(allKeys.map(ele => [ele, {'a': 5, 'b': 'a'}]));
  
    console.log('getKeys 3', await Storage.multiGet(allKeys));
  }
  
  test();
 }

 
 