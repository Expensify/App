import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import variables from '@styles/variables';
import SuccessScreenBase from './SuccessScreenBase';

const DefaultSuccessScreen = createScreenWithDefaults(
    SuccessScreenBase,
    {
        headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        illustration: 'OpenPadlock',
        iconWidth: variables.openPadlockWidth,
        iconHeight: variables.openPadlockHeight,
        title: 'multifactorAuthentication.biometricsTest.authenticationSuccessful',
    },
    'DefaultSuccessScreen',
);

export default DefaultSuccessScreen;
