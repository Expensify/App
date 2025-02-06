import {Platform} from 'react-native';

const isMobile = () => ['ios', 'android'].includes(Platform.OS);

export default isMobile;
