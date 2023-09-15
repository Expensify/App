import {getOSAndName as libGetOSAndName} from 'expensify-common/lib/Device';
import GetOSAndName from './types';

const getOSAndName: GetOSAndName = () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {device_name, os_version} = libGetOSAndName();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {device_name, os_version};
};
export default getOSAndName;
