// eslint-disable-next-line no-restricted-imports
import {StatusBar} from 'react-native';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// Overwrite setTranslucent and setBackgroundColor suppress warnings on iOS
StatusBar.setTranslucent = () => {};
StatusBar.setBackgroundColor = () => {};

export default StatusBar;
