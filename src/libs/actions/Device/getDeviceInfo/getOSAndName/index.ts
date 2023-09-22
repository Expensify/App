import {getOSAndName as libGetOSAndName} from 'expensify-common/lib/Device';
import GetOSAndName from './types';

const getOSAndName: GetOSAndName = () => {
    // Parameter names are predefined and we don't choose it here
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {device_name, os_version} = libGetOSAndName();
    // Parameter names are predefined and we don't choose it here
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {device_name, os_version};
};
export default getOSAndName;
