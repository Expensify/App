import {StatusBar} from 'react-native';

// Overwrite setTranslucent to suppress a warning on iOS
StatusBar.setTranslucent = () => {};

export default StatusBar;
