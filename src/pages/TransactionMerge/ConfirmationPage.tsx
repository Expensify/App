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
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import {buildMergedTransactionData, getReportIDForExpense, getSourceTransactionFromMergeTransaction, getTargetTransactionFromMergeTransaction} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function ConfirmationPage({route}: ConfirmationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, backTo, hash} = route.params;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    console.log('confirm');

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [targetTransaction = getTargetTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.targetTransactionID}`, {
        canBeMissing: true,
    });
    const [sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction)] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${mergeTransaction?.sourceTransactionID}`, {
        canBeMissing: true,
    });
    const targetTransactionParentReportID = getReportIDForExpense(targetTransaction);
    let [targetTransactionParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionParentReportID}`);

    // If coming from the search page, we might not have the report locally in the usual Onyx collection
    if (!targetTransactionParentReport && currentSearchResults?.data) {
        targetTransactionParentReport = currentSearchResults?.data[`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionParentReportID}`] ?? undefined;
    }

    const policyID = targetTransactionParentReport?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    // Build the merged transaction data for display
    const mergedTransactionData = useMemo(() => buildMergedTransactionData(targetTransaction, mergeTransaction), [targetTransaction, mergeTransaction]);

    const handleMergeExpenses = useCallback(() => {
        if (!targetTransaction || !mergeTransaction || !sourceTransaction) {
            return;
        }
        const reportID = mergeTransaction.reportID;

        setIsMergingExpenses(true);
        mergeTransactionRequest({mergeTransactionID: transactionID, mergeTransaction, targetTransaction, sourceTransaction, policy, policyTags, policyCategories});

        Navigation.dismissModalWithReport({reportID});
    }, [targetTransaction, mergeTransaction, sourceTransaction, transactionID, policy, policyTags, policyCategories]);

    if (isLoadingOnyxValue(mergeTransactionMetadata) || !targetTransactionParentReport?.reportID) {
        console.log('loading meta', isLoadingOnyxValue(mergeTransactionMetadata));
        console.log('loading report', targetTransactionParentReport?.reportID);
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
                    <MoneyRequestView
                        allReports={allReports}
                        expensePolicy={policy}
                        parentReportProp={targetTransactionParentReport}
                        shouldShowAnimatedBackground={false}
                        readonly
                        updatedTransaction={mergedTransactionData as unknown as OnyxEntry<Transaction>}
                        mergeTransactionID={transactionID}
                    />
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
