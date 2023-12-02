import packageConfig from '../../../../../package.json';
import {GetBaseInfo} from './types';

const getBaseInfo: GetBaseInfo = () => ({
    appVersion: packageConfig.version,
    timestamp: new Date().toISOString().slice(0, 19),
});

export default getBaseInfo;
