import type {Alert as AlertRN} from 'react-native';

type Alert = (typeof AlertRN)['alert'];

export default Alert;
