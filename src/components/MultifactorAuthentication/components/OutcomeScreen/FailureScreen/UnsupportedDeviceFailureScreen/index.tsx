import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';

const UnsupportedDeviceFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        title: 'multifactorAuthentication.unsupportedDevice.unsupportedDevice',
        subtitle: 'multifactorAuthentication.unsupportedDevice.pleaseDownloadMobileApp',
    },
    'UnsupportedDeviceFailureScreen',
);

export default UnsupportedDeviceFailureScreen;
