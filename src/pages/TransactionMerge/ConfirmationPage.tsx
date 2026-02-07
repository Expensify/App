import React, {useState} from 'react';
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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {mergeTransactionRequest} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildMergedTransactionData, getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ConfirmationPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function ConfirmationPage({route}: ConfirmationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMergingExpenses, setIsMergingExpenses] = useState(false);

    const {transactionID, isOnSearch, backTo} = route.params;

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const {targetTransaction, sourceTransaction, targetTransactionReport, targetTransactionPolicy} = useMergeTransactions({mergeTransaction});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        canBeMissing: false,
    });

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(targetTransactionPolicy?.id)}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(targetTransactionPolicy?.id)}`, {canBeMissing: true});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const targetTransactionThreadReportID = getTransactionThreadReportID(targetTransaction);
    const [targetTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransactionThreadReportID}`, {canBeMissing: true});
    const [targetTransactionThreadParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`, {canBeMissing: true});
    const [targetTransactionThreadParentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(targetTransactionThreadReport?.parentReportID)}`, {
        canBeMissing: true,
    });

    // Build the merged transaction data for display
    const mergedTransactionData = buildMergedTransactionData(targetTransaction, mergeTransaction);

    const handleMergeExpenses = () => {
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
            targetTransactionThreadReport,
            targetTransactionThreadParentReport,
            targetTransactionThreadParentReportNextStep,
            allTransactionViolations,
            policy: targetTransactionPolicy,
            policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
        });

        const reportIDToDismiss = reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? reportID : undefined;

        // If we're on search, dismiss the modal and stay on search
        if (!isOnSearch && reportIDToDismiss && reportID !== targetTransaction.reportID) {
            // Navigate to search money report screen if we're on Reports
            if (isSearchTopmostFullScreenRoute()) {
                // Close the current modal screen
                Navigation.dismissModal();
                // Ensure the dismiss completes first
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    // Navigate to the money request report in search results
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reportIDToDismiss}));
                });
            } else {
                Navigation.dismissModalWithReport({reportID: reportIDToDismiss});
            }
        } else {
            Navigation.dismissToSuperWideRHP();
        }
    };

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="ConfirmationPage"
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
                        expensePolicy={targetTransactionPolicy}
                        parentReportID={targetTransactionReport?.reportID}
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

export default ConfirmationPage;
