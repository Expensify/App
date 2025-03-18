import {initializeApp} from '@firebase/app';
import {getPerformance, initializePerformance} from '@firebase/performance';
import Config from '@src/CONFIG';

const firebaseConfig = Config.FIREBASE_WEB_CONFIG;
const firebaseApp = initializeApp(firebaseConfig);

initializePerformance(firebaseApp, {dataCollectionEnabled: true});

const firebasePerfWeb = getPerformance(firebaseApp);

export {firebaseApp, firebasePerfWeb};
