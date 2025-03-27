import DeviceInfo from 'react-native-device-info';
import type GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    androidPackage: DeviceInfo.getBundleId(),
});

export default getPlaidLinkTokenParameters;
