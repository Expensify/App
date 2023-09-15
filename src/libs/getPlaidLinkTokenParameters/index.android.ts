import CONST from '../../CONST';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    android_package: CONST.ANDROID_PACKAGE_NAME, // eslint-disable-line @typescript-eslint/naming-convention
});

export default getPlaidLinkTokenParameters;
