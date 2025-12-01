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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import {buildMergedTransactionData, getReportIDForExpense, getSourceTransactionFromMergeTransaction, getTargetTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportActions, Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function ConfirmationPage({route}: ConfirmationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, backTo} = route.params;

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });
    const [sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });
    const targetTransactionThreadReportIDSelector = useCallback(
        (reportActionsList: OnyxEntry<ReportActions>) => {
            const reportActions = Object.values(reportActionsList ?? {});
            const transactionIOUReportAction = mergeTransaction?.targetTransactionID ? getIOUActionForTransactionID(reportActions, mergeTransaction.targetTransactionID) : undefined;
            return transactionIOUReportAction?.childReportID;
        },
        [mergeTransaction?.targetTransactionID],
    );
    const targetTransactionParentReportID = getReportIDForExpense(targetTransaction);
    const [targetTransactionThreadReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetTransactionParentReportID}`, {
        canBeMissing: true,
        selector: targetTransactionThreadReportIDSelector,
    });
    const targetTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`];
    const policyID = targetTransactionThreadReport?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

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
        const reportID = mergeTransaction.reportID;

        setIsMergingExpenses(true);
        mergeTransactionRequest({
            mergeTransactionID: transactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            policy,
            policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
        });

        const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : targetTransactionThreadReportID;
        if (reportID !== targetTransaction.reportID && reportIDToDismiss) {
            Navigation.dismissModalWithReport({reportID: reportIDToDismiss});
        } else {
            Navigation.dismissModal();
        }
    }, [
        targetTransaction,
        mergeTransaction,
        sourceTransaction,
        transactionID,
        targetTransactionThreadReportID,
        policy,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
    ]);

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
                            expensePolicy={policy}
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
