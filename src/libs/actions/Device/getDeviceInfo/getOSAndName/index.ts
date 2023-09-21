// Don't import this file with '* as Device'. It's known to make VSCode IntelliSense crash.
import {getOSAndName} from 'expensify-common/lib/Device';

export type GetOSAndName = () => OSAndName;
export type OSAndName = {
    device_name: string;
    os_version: string;
}
export default getOSAndName;
