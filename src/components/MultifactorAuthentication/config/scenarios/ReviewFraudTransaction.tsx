import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {
    DefaultClientFailureScreen,
    DefaultServerFailureScreen,
    NoEligibleMethodsFailureScreen,
} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import UnsupportedDeviceFailureScreen from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/UnsupportedDeviceFailureScreen';
import DefaultSuccessScreen from '@components/MultifactorAuthentication/components/OutcomeScreen/SuccessScreen/defaultScreens';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';

import variables from '@styles/variables';

import {confirmRecognizedTransaction} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';

import React from 'react';

import {AlreadyReviewedFailureScreen} from './AuthorizeTransaction';

type Payload = {
    transactionID: string;
};

const TryAgainSuccessScreen = createScreenWithDefaults(
    DefaultSuccessScreen,
    {
        headerTitle: 'multifactorAuthentication.fraudReview.tryAgain',
        illustration: 'CardPosRefresh',
        iconWidth: variables.cardPosRefreshWidth,
        iconHeight: variables.cardPosRefreshHeight,
        title: 'multifactorAuthentication.fraudReview.giveItAnotherTry',
        subtitle: 'multifactorAuthentication.fraudReview.thankYouForConfirming',
    },
    'TryAgainSuccessScreen',
);

const ReviewClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {headerTitle: 'multifactorAuthentication.reviewTransaction.reviewFailed'},
    'ReviewClientFailureScreen',
);

const ReviewServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {headerTitle: 'multifactorAuthentication.reviewTransaction.reviewFailed'},
    'ReviewServerFailureScreen',
);

export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: confirmRecognizedTransaction,
    successScreen: <TryAgainSuccessScreen />,
    defaultClientFailureScreen: <ReviewClientFailureScreen />,
    defaultServerFailureScreen: <ReviewServerFailureScreen />,
    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.ALREADY_REVIEWED]: <AlreadyReviewedFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED]: (
            <NoEligibleMethodsFailureScreen headerTitle="multifactorAuthentication.reviewTransaction.reviewFailed" />
        ),
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED]: (
            <UnsupportedDeviceFailureScreen headerTitle="multifactorAuthentication.reviewTransaction.reviewFailed" />
        ),
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
