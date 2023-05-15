import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName';

export default function getDeviceInfo() {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
        os: 'Android',
    };
}
