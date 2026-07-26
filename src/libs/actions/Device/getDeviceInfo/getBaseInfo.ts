import type {GetBaseInfo} from './types';

import packageConfig from '../../../../../package.json';

const getBaseInfo: GetBaseInfo = () => ({
    appVersion: packageConfig.version,
    timestamp: new Date().toISOString().slice(0, 19),
});

export default getBaseInfo;
