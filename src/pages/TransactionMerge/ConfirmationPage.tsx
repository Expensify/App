import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import {buildMergedTransactionData, getSourceTransaction, getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

type ConfirmationProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function Confirmation({route}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, backTo} = route.params;

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});

    const targetTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getTransactionThreadReportID(targetTransaction)}`];
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionThreadReport?.policyID}`, {canBeMissing: true});

    const sourceTransaction = getSourceTransaction(mergeTransaction);

    // Build the merged transaction data for display
    const mergedTransactionData = useMemo(() => {
        return buildMergedTransactionData(targetTransaction, mergeTransaction);
    }, [targetTransaction, mergeTransaction]);

    const contextValue = useMemo(
        () => ({
            transactionThreadReport: targetTransactionThreadReport,
            action: undefined,
            report: targetTransactionThreadReport,
            checkIfContextMenuActive: () => {},
            onShowContextMenu: () => {},
            isReportArchived: false,
            anchor: null,
            isDisabled: false,
        }),
        [targetTransactionThreadReport],
    );

    const handleMergeExpenses = useCallback(() => {
        if (!targetTransaction || !mergeTransaction || !sourceTransaction) {
            return;
        }

        setIsMergingExpenses(true);
        mergeTransactionRequest(transactionID, mergeTransaction, targetTransaction, sourceTransaction);
        Navigation.dismissModal();
    }, [targetTransaction, mergeTransaction, sourceTransaction, transactionID]);

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction && !isMergingExpenses}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.confirmationPage.header')}
                    onBackButtonPress={() => {
                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }
                        Navigation.goBack();
                    }}
                />
                <ScrollView>
                    <View style={[styles.ph5, styles.pb8]}>
                        <Text>{translate('transactionMerge.confirmationPage.pageTitle')}</Text>
                    </View>
                    <ShowContextMenuContext.Provider value={contextValue}>
                        <MoneyRequestView
                            allReports={allReports}
                            policy={policy}
                            report={targetTransactionThreadReport}
                            shouldShowAnimatedBackground={false}
                            readonly
                            updatedTransaction={mergedTransactionData as unknown as OnyxEntry<Transaction>}
                            mergeTransactionID={transactionID}
                        />
                    </ShowContextMenuContext.Provider>
                </ScrollView>
                <FixedFooter style={styles.ph5}>
                    <Button
                        text={translate('transactionMerge.confirmationPage.confirmButton')}
                        success
                        onPress={handleMergeExpenses}
                        large
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
