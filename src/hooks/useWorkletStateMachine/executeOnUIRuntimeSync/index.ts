// executeOnUIRuntimeSync crashes on web not because browsers lack a UI thread concept,
// but because this specific function attempts to use direct, synchronous thread communication
// methods that don't exist in browsers
// runOnUI works on web because it's designed with proper cross-platform compatibility
import {runOnUI} from 'react-native-reanimated';

export default runOnUI;
