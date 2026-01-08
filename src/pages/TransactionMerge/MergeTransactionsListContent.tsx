import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, setupMergeTransactionData, setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {fillMissingReceiptSource} from '@libs/MergeTransactionUtils';
import {getTransactionReportName, isIOUReport} from '@libs/ReportUtils';
import {getCreated, isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const currentUserLogin = session?.email;
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const {isOffline} = useNetwork();

    const eligibleTransactions = mergeTransaction?.eligibleTransactions;
    const {targetTransaction, sourceTransaction, targetTransactionReport, sourceTransactionReport} = useMergeTransactions({mergeTransaction});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionReport?.policyID}`, {canBeMissing: true});

    useEffect(() => {
        // If the eligible transactions are already loaded, don't fetch them again
        if (Array.isArray(mergeTransaction?.eligibleTransactions) || !targetTransaction) {
            return;
        }

        getTransactionsForMerging({isOffline, targetTransaction, transactions, policy, report: targetTransactionReport, currentUserLogin});
    }, [transactions, isOffline, mergeTransaction?.eligibleTransactions, policy, targetTransactionReport, currentUserLogin, targetTransaction]);

    const data = useMemo(() => {
        if (!eligibleTransactions) {
            return [];
        }

        return eligibleTransactions
            .filter((transaction) => {
                if (isExpenseUnreported(transaction)) {
                    return true;
                }

                return !isIOUReport(transaction?.reportID);
            })
            .map((eligibleTransaction) => ({
                ...fillMissingReceiptSource(eligibleTransaction),
                keyForList: eligibleTransaction.transactionID,
                isSelected: eligibleTransaction.transactionID === mergeTransaction?.sourceTransactionID,
                errors: eligibleTransaction.errors as Errors | undefined,
            }))
            .sort((a, b) => localeCompare(getCreated(b), getCreated(a)));
    }, [eligibleTransactions, mergeTransaction?.sourceTransactionID, localeCompare]);

    const handleSelectRow = useCallback(
        (item: MergeTransactionListItemType) => {
            // Clear the merge transaction data when select a new source transaction to merge
            setupMergeTransactionData(transactionID, {
                targetTransactionID: transactionID,
                sourceTransactionID: item.transactionID,
                eligibleTransactions: mergeTransaction?.eligibleTransactions,
            });
        },
        [mergeTransaction?.eligibleTransactions, transactionID],
    );

    const transactionDisplayName = targetTransaction
        ? getTransactionReportName({
              reportAction: undefined,
              transactions: [targetTransaction],
              reports: targetTransactionReport ? [targetTransactionReport] : [],
          })
        : '';

    const headerContent = (
        <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow]}>
            <RenderHTML html={translate('transactionMerge.listPage.selectTransactionToMerge', {reportName: transactionDisplayName})} />
        </View>
    );

    const subTitleContent = (
        <View style={[styles.renderHTML, styles.textNormal]}>
            <RenderHTML html={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')} />
        </View>
    );

    const handleConfirm = useCallback(() => {
        if (!sourceTransaction || !targetTransaction) {
            return;
        }

        const reports = targetTransactionReport && sourceTransactionReport ? [targetTransactionReport, sourceTransactionReport] : undefined;
        setupMergeTransactionDataAndNavigate(transactionID, [targetTransaction, sourceTransaction], localeCompare, reports, true);
    }, [transactionID, targetTransaction, sourceTransaction, targetTransactionReport, sourceTransactionReport, localeCompare]);

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.continue'),
        style: styles.justifyContentCenter,
        isDisabled: !mergeTransaction?.sourceTransactionID,
        onConfirm: handleConfirm,
    };

    const shouldShowLoadingPlaceholder = !isOffline && !Array.isArray(eligibleTransactions);

    if (eligibleTransactions?.length === 0 || (!eligibleTransactions && !shouldShowLoadingPlaceholder && data.length === 0)) {
        return (
            <View style={styles.flex1}>
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                    <EmptyStateComponent
                        cardStyles={[styles.appBG]}
                        cardContentStyles={[styles.p0]}
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                        headerMedia={illustrations.EmptyShelves}
                        title={translate('transactionMerge.listPage.noEligibleExpenseFound')}
                        subtitleText={subTitleContent}
                        headerStyles={[styles.emptyStateCardIllustrationContainer, styles.mb5]}
                        headerContentStyles={styles.emptyStateTransactionMergeIllustration}
                    />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <SelectionList<MergeTransactionListItemType>
                data={data}
                onSelectRow={handleSelectRow}
                ListItem={MergeTransactionItem}
                customListHeader={headerContent}
                confirmButtonOptions={confirmButtonOptions}
                customLoadingPlaceholder={<MergeExpensesSkeleton fixedNumItems={3} />}
                showLoadingPlaceholder={shouldShowLoadingPlaceholder}
            />
        </View>
    );
}

export default MergeTransactionsListContent;
