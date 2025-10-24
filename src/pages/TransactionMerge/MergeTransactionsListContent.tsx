import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import {EmptyShelves} from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, setMergeTransactionKey, setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {
    fillMissingReceiptSource,
    getMergeableDataAndConflictFields,
    getSourceTransactionFromMergeTransaction,
    getTransactionThreadReportID,
    selectTargetAndSourceTransactionsForMerge,
    shouldNavigateToReceiptReview,
} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getReportName, getReportOrDraftReport} from '@libs/ReportUtils';
import {getCreated} from '@libs/TransactionUtils';
import {openReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {MergeTransaction} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Transaction from '@src/types/onyx/Transaction';
import MergeTransactionItem from './MergeTransactionItem';

type MergeTransactionsListContentProps = {
    transactionID: string;
    mergeTransaction: OnyxEntry<MergeTransaction>;
};

type MergeTransactionListItemType = Transaction & ListItem;

function MergeTransactionsListContent({transactionID, mergeTransaction}: MergeTransactionsListContentProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const {isOffline} = useNetwork();
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${targetTransaction?.reportID}`, {canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getTransactionThreadReportID(targetTransaction)}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: false});
    const eligibleTransactions = mergeTransaction?.eligibleTransactions;
    const currentUserLogin = session?.email;

    useEffect(() => {
        // If the eligible transactions are already loaded, don't fetch them again
        if (Array.isArray(mergeTransaction?.eligibleTransactions) || !targetTransaction) {
            return;
        }

        getTransactionsForMerging({isOffline, targetTransaction, transactions, policy, report, currentUserLogin});
    }, [transactions, isOffline, mergeTransaction, policy, report, currentUserLogin, targetTransaction]);

    const sections = useMemo(() => {
        return [
            {
                data: (eligibleTransactions ?? [])
                    .map((eligibleTransaction) => ({
                        ...fillMissingReceiptSource(eligibleTransaction),
                        keyForList: eligibleTransaction.transactionID,
                        isSelected: eligibleTransaction.transactionID === mergeTransaction?.sourceTransactionID,
                        errors: eligibleTransaction.errors as Errors | undefined,
                    }))
                    .sort((a, b) => localeCompare(getCreated(b), getCreated(a))),
                shouldShow: true,
            },
        ];
    }, [eligibleTransactions, mergeTransaction, localeCompare]);

    const handleSelectRow = useCallback(
        (item: MergeTransactionListItemType) => {
            // Clear the merge transaction data when select a new source transaction to merge
            setupMergeTransactionData(transactionID, {
                targetTransactionID: transactionID,
                sourceTransactionID: item.transactionID,
                eligibleTransactions: mergeTransaction?.eligibleTransactions,
            });
        },
        [mergeTransaction, transactionID],
    );

    const headerContent = useMemo(
        () => (
            <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow]}>
                <RenderHTML html={translate('transactionMerge.listPage.selectTransactionToMerge', {reportName: getReportName(transactionThreadReport ?? report)})} />
            </View>
        ),
        [transactionThreadReport, report, translate, styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow],
    );

    const subTitleContent = useMemo(() => {
        return (
            <View style={[styles.renderHTML, styles.textNormal]}>
                <RenderHTML html={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')} />
            </View>
        );
    }, [translate, styles.renderHTML, styles.textNormal]);

    const handleConfirm = useCallback(() => {
        const sourceTransaction = getSourceTransactionFromMergeTransaction(mergeTransaction);

        if (!sourceTransaction || !targetTransaction) {
            return;
        }

        // It's a temporary solution to ensure the source report is loaded, so we can display reportName in the merge transaction details page
        // We plan to remove this in next phase of merge expenses project
        const sourceReport = getReportOrDraftReport(sourceTransaction.reportID);
        if (!sourceReport) {
            openReport(sourceTransaction.reportID);
        }

        const {targetTransaction: newTargetTransaction, sourceTransaction: newSourceTransaction} = selectTargetAndSourceTransactionsForMerge(targetTransaction, sourceTransaction);
        if (shouldNavigateToReceiptReview([newTargetTransaction, newSourceTransaction])) {
            setMergeTransactionKey(transactionID, {
                targetTransactionID: newTargetTransaction?.transactionID,
                sourceTransactionID: newSourceTransaction?.transactionID,
            });
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_RECEIPT_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        } else {
            const mergedReceipt = newTargetTransaction?.receipt?.receiptID ? newTargetTransaction.receipt : newSourceTransaction?.receipt;
            setMergeTransactionKey(transactionID, {
                targetTransactionID: newTargetTransaction?.transactionID,
                sourceTransactionID: newSourceTransaction?.transactionID,
                receipt: mergedReceipt,
            });

            const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(newTargetTransaction, newSourceTransaction, localeCompare);
            if (!conflictFields.length) {
                // If there are no conflict fields, we should set mergeable data and navigate to the confirmation page
                setMergeTransactionKey(transactionID, mergeableData);
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
                return;
            }
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        }
    }, [mergeTransaction, transactionID, targetTransaction, localeCompare]);

    if (eligibleTransactions?.length === 0) {
        return (
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                <EmptyStateComponent
                    cardStyles={[styles.appBG]}
                    cardContentStyles={[styles.p0]}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                    headerMedia={EmptyShelves}
                    title={translate('transactionMerge.listPage.noEligibleExpenseFound')}
                    subtitleText={subTitleContent}
                    headerStyles={[styles.emptyStateCardIllustrationContainer, styles.mb5]}
                    headerContentStyles={styles.emptyStateTransactionMergeIllustration}
                />
            </ScrollView>
        );
    }

    return (
        <SelectionList<MergeTransactionListItemType>
            sections={sections}
            shouldShowTextInput={false}
            ListItem={MergeTransactionItem}
            confirmButtonStyles={[styles.justifyContentCenter]}
            showConfirmButton
            confirmButtonText={translate('common.continue')}
            isConfirmButtonDisabled={!mergeTransaction?.sourceTransactionID}
            onSelectRow={handleSelectRow}
            showLoadingPlaceholder
            LoadingPlaceholderComponent={MergeExpensesSkeleton}
            fixedNumItemsForLoader={3}
            headerContent={headerContent}
            onConfirm={handleConfirm}
        />
    );
}

MergeTransactionsListContent.displayName = 'MergeTransactionsListContent';

export default MergeTransactionsListContent;
