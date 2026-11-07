import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';

import Debug from '@libs/actions/Debug';
import DebugUtils from '@libs/DebugUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {DebugTabNavigatorRoutes} from '@libs/Navigation/DebugTabNavigator';
import DebugTabNavigator from '@libs/Navigation/DebugTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';

import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {TransactionViolation} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type DebugTransactionViolationPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.TRANSACTION_VIOLATION>;

function DebugTransactionViolationPage({
    route: {
        params: {transactionID, index},
    },
}: DebugTransactionViolationPageProps) {
    const {translate} = useLocalize();
    const transactionViolations = useTransactionViolations(transactionID);
    const transactionViolation = transactionViolations?.[Number(index)];

    const styles = useThemeStyles();

    const saveChanges = (data: Record<string, unknown>) => {
        const updatedTransactionViolations = [...(transactionViolations ?? [])];
        updatedTransactionViolations.splice(Number(index), 1, data as TransactionViolation);
        Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, updatedTransactionViolations);
    };

    const deleteTransactionViolation = () => {
        const updatedTransactionViolations = [...(transactionViolations ?? [])];
        updatedTransactionViolations.splice(Number(index), 1);
        Navigation.goBack(undefined, {
            // We need to wait for navigation animations to finish before deleting a violation,
            // otherwise the user will see a not found page briefly.
            afterTransition: () => {
                Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, updatedTransactionViolations);
            },
        });
    };

    const detailsTab = (
        <DebugDetails
            formType={CONST.DEBUG.FORMS.TRANSACTION_VIOLATION}
            data={transactionViolation}
            onSave={saveChanges}
            onDelete={deleteTransactionViolation}
            validate={DebugUtils.validateTransactionViolationDraftProperty}
        />
    );

    const jsonTab = <DebugJSON data={transactionViolation ?? {}} />;

    const routes: DebugTabNavigatorRoutes = [
        {name: CONST.DEBUG.DETAILS, content: detailsTab},
        {name: CONST.DEBUG.JSON, content: jsonTab},
    ];

    if (!transactionViolation) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="DebugTransactionViolationPage"
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.transactionViolation')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <DebugTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        routes={routes}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

export default DebugTransactionViolationPage;
