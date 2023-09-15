import CONST from '../../CONST';
import GetPlaidLinkTokenParameters from './types';

const getPlaidLinkTokenParameters: GetPlaidLinkTokenParameters = () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    android_package: CONST.ANDROID_PACKAGE_NAME,
});

export default getPlaidLinkTokenParameters;
