import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
import {buildMergedTransactionData, getSourceTransactionFromMergeTransaction, getTargetTransactionFromMergeTransaction, getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function ConfirmationPage({route}: ConfirmationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, backTo} = route.params;

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });
    const [sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });

    const targetTransactionThreadReportID = getTransactionThreadReportID(targetTransaction);
    const targetTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`];
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionThreadReport?.policyID}`, {canBeMissing: true});

    // Build the merged transaction data for display
    const mergedTransactionData = useMemo(() => buildMergedTransactionData(targetTransaction, mergeTransaction), [targetTransaction, mergeTransaction]);

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

    if (isLoadingOnyxValue(mergeTransactionMetadata) || !targetTransactionThreadReport?.reportID) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={ConfirmationPage.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction && !isMergingExpenses}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.confirmationPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack(backTo);
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

ConfirmationPage.displayName = 'ConfirmationPage';

export default ConfirmationPage;
