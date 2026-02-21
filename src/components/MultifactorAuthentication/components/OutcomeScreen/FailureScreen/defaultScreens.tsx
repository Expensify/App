import React from 'react';
import NoEligibleMethodsDescription from '@components/MultifactorAuthentication/components/NoEligibleMethodsDescription';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import UnsupportedDeviceDescription from '@components/MultifactorAuthentication/components/UnsupportedDeviceDescription';
import variables from '@styles/variables';
import FailureScreenBase from './FailureScreenBase';

const DefaultClientFailureScreen = createScreenWithDefaults(
    FailureScreenBase,
    {
        illustration: 'MagnifyingGlassSpyMouthClosed',
        iconWidth: variables.magnifyingGlassSpyMouthClosedWidth,
        iconHeight: variables.magnifyingGlassSpyMouthClosedHeight,
        title: 'multifactorAuthentication.verificationFailed',
        subtitle: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
    },
    'DefaultClientFailureScreen',
);

const DefaultServerFailureScreen = createScreenWithDefaults(
    FailureScreenBase,
    {
        illustration: 'HumptyDumpty',
        iconWidth: variables.humptyDumptyWidth,
        iconHeight: variables.humptyDumptyHeight,
        title: 'multifactorAuthentication.oops',
        subtitle: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
    },
    'DefaultServerFailureScreen',
);

const OutOfTimeFailureScreen = createScreenWithDefaults(
    FailureScreenBase,
    {
        illustration: 'RunOutOfTime',
        iconWidth: variables.runOutOfTimeWidth,
        iconHeight: variables.runOutOfTimeHeight,
        title: 'multifactorAuthentication.youRanOutOfTime',
        subtitle: 'multifactorAuthentication.looksLikeYouRanOutOfTime',
    },
    'OutOfTimeFailureScreen',
);

const NoEligibleMethodsFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        title: 'multifactorAuthentication.biometricsTest.youCouldNotBeAuthenticated',
        customSubtitle: <NoEligibleMethodsDescription />,
    },
    'NoEligibleMethodsFailureScreen',
);

const UnsupportedDeviceFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        title: 'multifactorAuthentication.unsupportedDevice.unsupportedDevice',
        customSubtitle: <UnsupportedDeviceDescription />,
    },
    'UnsupportedDeviceFailureScreen',
);

export {DefaultClientFailureScreen, DefaultServerFailureScreen, OutOfTimeFailureScreen, NoEligibleMethodsFailureScreen, UnsupportedDeviceFailureScreen};
