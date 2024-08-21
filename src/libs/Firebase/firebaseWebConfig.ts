import {initializeApp} from 'firebase/app';
import {getPerformance, initializePerformance} from 'firebase/performance';

// TODO add newly created Firebase web project details before merging

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

initializePerformance(firebaseApp, {dataCollectionEnabled: true});

const firebasePerfWeb = getPerformance(firebaseApp);

export {firebaseApp, firebasePerfWeb};
