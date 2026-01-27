import {initializeApp} from '@firebase/app';
import Config from '@src/CONFIG';

const firebaseConfig = Config.FIREBASE_WEB_CONFIG;
const firebaseApp = initializeApp(firebaseConfig);

export default {
    firebaseApp,
};
