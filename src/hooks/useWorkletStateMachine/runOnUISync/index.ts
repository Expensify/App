// runOnUISync crashes on web not because browsers lack a UI thread concept,
// but because this specific function attempts to use direct, synchronous thread communication
// methods that don't exist in browsers
// scheduleOnUI works on web because it's designed with proper cross-platform compatibility
import {scheduleOnUI} from 'react-native-worklets';

export default scheduleOnUI;
