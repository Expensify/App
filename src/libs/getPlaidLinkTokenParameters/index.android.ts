import CONST from '@src/CONST';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    androidPackage: CONST.ANDROID_PACKAGE_NAME,
});

export default getPlaidLinkTokenParameters;
