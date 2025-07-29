import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import {EmptyShelves} from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, getTransactionsForMergingLocally, setMergeTransactionKey, setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {
    fillMissingReceiptSource,
    getReportIDOfTargetTransaction,
    getSourceTransaction,
    selectTargetAndSourceTransactionIDsForMerge,
    shouldNavigateToReceiptReview,
} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getReportName} from '@libs/ReportUtils';
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
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const {isOffline} = useNetwork();
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getReportIDOfTargetTransaction(targetTransaction)}`, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: false});
    const eligibleTransactions = mergeTransaction?.eligibleTransactions;
    const currentUserLogin = session?.email;

    useEffect(() => {
        // If the eligible transactions are already loaded, don't fetch them again
        if (Array.isArray(mergeTransaction?.eligibleTransactions)) {
            return;
        }

        if (isOffline) {
            getTransactionsForMergingLocally(transactionID, transactions, policy, report, currentUserLogin);
        } else {
            getTransactionsForMerging(transactionID);
        }
    }, [transactionID, transactions, isOffline, mergeTransaction, policy, report, currentUserLogin]);

    const sections = useMemo(() => {
        return [
            {
                data: (eligibleTransactions ?? []).map((eligibleTransaction) => ({
                    ...fillMissingReceiptSource(eligibleTransaction),
                    keyForList: eligibleTransaction.transactionID,
                    isSelected: eligibleTransaction.transactionID === mergeTransaction?.sourceTransactionID,
                    errors: eligibleTransaction.errors as Errors | undefined,
                })),
                shouldShow: true,
            },
        ];
    }, [eligibleTransactions, mergeTransaction]);

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
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.minHeight5]}>
                    <RenderHTML html={translate('transactionMerge.listPage.selectTransactionToMerge', {reportName: getReportName(report)})} />
                </Text>
            </View>
        ),
        [report, translate, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5],
    );

    const subTitleContent = useMemo(() => {
        return (
            <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                <RenderHTML html={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')} />
            </Text>
        );
    }, [translate, styles.textAlignCenter, styles.textSupporting, styles.textNormal]);

    const handleConfirm = useCallback(() => {
        const sourceTransaction = getSourceTransaction(mergeTransaction);

        if (!sourceTransaction || !targetTransaction) {
            return;
        }

        const {targetTransactionID: newTargetTransactionID, sourceTransactionID: newSourceTransactionID} = selectTargetAndSourceTransactionIDsForMerge(targetTransaction, sourceTransaction);

        if (shouldNavigateToReceiptReview([targetTransaction, sourceTransaction])) {
            setMergeTransactionKey(transactionID, {
                targetTransactionID: newTargetTransactionID,
                sourceTransactionID: newSourceTransactionID,
            });
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_RECEIPT_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        } else {
            const mergedReceipt = targetTransaction?.receipt?.receiptID ? targetTransaction.receipt : sourceTransaction?.receipt;
            setMergeTransactionKey(transactionID, {
                targetTransactionID: newTargetTransactionID,
                sourceTransactionID: newSourceTransactionID,
                receipt: mergedReceipt,
            });
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
        }
    }, [mergeTransaction, transactionID, targetTransaction]);

    if (eligibleTransactions?.length === 0) {
        return (
            <EmptyStateComponent
                cardStyles={[styles.appBG]}
                cardContentStyles={[styles.p0]}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                headerMedia={EmptyShelves}
                title={translate('transactionMerge.listPage.noEligibleExpenseFound')}
                subtitleText={subTitleContent}
                headerStyles={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                headerContentStyles={styles.emptyStateCardIllustration}
            />
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
