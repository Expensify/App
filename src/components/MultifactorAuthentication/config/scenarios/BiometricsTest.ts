import type {MultifactorAuthenticationScenarioConfig} from '@components/MultifactorAuthentication/config/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import {biometricsTest} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

export default {
    allowedAuthentication: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
    action: biometricsTest,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST,
    NOTIFICATIONS: {
        success: {
            illustration: 'OpenPadlock',
            iconWidth: variables.openPadlockWidth,
            iconHeight: variables.openPadlockHeight,
            padding: spacing.p2,
        },
        failure: {
            illustration: 'HumptyDumpty',
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
        },
        outOfTime: {
            illustration: 'RunOutOfTime',
            iconWidth: variables.runOutOfTimeWidth,
            iconHeight: variables.runOutOfTimeHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.uiText.outOfTime.headerTitle',
            title: 'multifactorAuthentication.uiText.outOfTime.title',
        },
    },
    MODALS: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multifactorAuthentication.approveTransaction.denyTransactionContent',
            confirmButtonText: 'multifactorAuthentication.approveTransaction.denyTransactionButton',
            cancelButtonText: 'common.cancel',
        },
    },
} as const satisfies MultifactorAuthenticationScenarioConfig;
