// runOnUISync isn't supported in web by react-native-worklets, so we use the async alternative on web.
import {scheduleOnUI} from 'react-native-worklets';

export default scheduleOnUI;
