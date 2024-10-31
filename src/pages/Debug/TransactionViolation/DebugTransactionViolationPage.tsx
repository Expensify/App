import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Debug from '@libs/actions/Debug';
import DebugUtils from '@libs/DebugUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {DebugParamList} from '@libs/Navigation/types';
import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.TRANSACTION_VIOLATION>;

function DebugTransactionViolationPage({
    route: {
        params: {transactionID, index},
    },
}: DebugTransactionViolationPageProps) {
    const {translate} = useLocalize();
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const transactionViolation = useMemo(() => transactionViolations?.[Number(index)], [index, transactionViolations]);
    const styles = useThemeStyles();

    const saveChanges = useCallback(
        (data: Record<string, unknown>) => {
            const updatedTransactionViolations = [...(transactionViolations ?? [])];
            updatedTransactionViolations.splice(Number(index), 1, data as TransactionViolation);
            Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, updatedTransactionViolations);
        },
        [index, transactionID, transactionViolations],
    );

    const deleteTransactionViolation = useCallback(() => {
        const updatedTransactionViolations = [...(transactionViolations ?? [])];
        updatedTransactionViolations.splice(Number(index), 1);
        Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, updatedTransactionViolations);
    }, [index, transactionID, transactionViolations]);

    if (!transactionViolation) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={DebugTransactionViolationPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.transactionViolation')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OnyxTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        tabBar={TabSelector}
                    >
                        <TopTab.Screen name={CONST.DEBUG.DETAILS}>
                            {() => (
                                <DebugDetails
                                    formType={CONST.DEBUG.FORMS.TRANSACTION_VIOLATION}
                                    data={transactionViolation}
                                    onSave={saveChanges}
                                    onDelete={deleteTransactionViolation}
                                    validate={DebugUtils.validateTransactionViolationDraftProperty}
                                />
                            )}
                        </TopTab.Screen>
                        <TopTab.Screen name={CONST.DEBUG.JSON}>{() => <DebugJSON data={transactionViolation ?? {}} />}</TopTab.Screen>
                    </OnyxTabNavigator>
                </View>
            )}
        </ScreenWrapper>
    );
}

DebugTransactionViolationPage.displayName = 'DebugTransactionViolationPage';

export default DebugTransactionViolationPage;
