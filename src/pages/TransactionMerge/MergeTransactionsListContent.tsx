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
import {getTransactionsForMerging, setMergeTransactionKey, setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {fillMissingReceiptSource, getMergeableDataAndConflictFields, selectTargetAndSourceTransactionsForMerge, shouldNavigateToReceiptReview} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAmount, getCreated, getCurrency, getMerchant} from '@libs/TransactionUtils';
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
    hash?: number;
};

type MergeTransactionListItemType = Transaction & ListItem;

function MergeTransactionsListContent({transactionID, mergeTransaction, hash}: MergeTransactionsListContentProps) {
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves'] as const);
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const currentUserLogin = session?.email;
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const {isOffline} = useNetwork();

    const eligibleTransactions = mergeTransaction?.eligibleTransactions;
    const {targetTransaction, sourceTransaction, targetTransactionReport} = useMergeTransactions({mergeTransaction, hash});
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

    const headerContent = useMemo(
        () => (
            <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow]}>
                <RenderHTML
                    html={translate('iou.transactionDisplayName', {
                        amount: convertToDisplayString(getAmount(targetTransaction), getCurrency(targetTransaction)),
                        merchant: getMerchant(targetTransaction),
                    })}
                />
            </View>
        ),
        [targetTransaction, translate, styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow],
    );

    const subTitleContent = useMemo(() => {
        return (
            <View style={[styles.renderHTML, styles.textNormal]}>
                <RenderHTML html={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')} />
            </View>
        );
    }, [translate, styles.renderHTML, styles.textNormal]);

    const handleConfirm = useCallback(() => {
        if (!sourceTransaction || !targetTransaction) {
            return;
        }

        const {targetTransaction: newTargetTransaction, sourceTransaction: newSourceTransaction} = selectTargetAndSourceTransactionsForMerge(targetTransaction, sourceTransaction);
        if (shouldNavigateToReceiptReview([newTargetTransaction, newSourceTransaction])) {
            setMergeTransactionKey(transactionID, {
                targetTransactionID: newTargetTransaction?.transactionID,
                sourceTransactionID: newSourceTransaction?.transactionID,
            });
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_RECEIPT_PAGE.getRoute(transactionID));
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
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID));
                return;
            }
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(transactionID));
        }
    }, [transactionID, targetTransaction, sourceTransaction, localeCompare]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.continue'),
            style: styles.justifyContentCenter,
            isDisabled: !mergeTransaction?.sourceTransactionID,
            onConfirm: handleConfirm,
        }),
        [handleConfirm, mergeTransaction?.sourceTransactionID, styles.justifyContentCenter, translate],
    );

    if (eligibleTransactions?.length === 0) {
        return (
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
        );
    }

    return (
        <SelectionList<MergeTransactionListItemType>
            data={data}
            onSelectRow={handleSelectRow}
            ListItem={MergeTransactionItem}
            customListHeader={headerContent}
            confirmButtonOptions={confirmButtonOptions}
            customLoadingPlaceholder={<MergeExpensesSkeleton fixedNumItems={3} />}
            showLoadingPlaceholder
        />
    );
}

MergeTransactionsListContent.displayName = 'MergeTransactionsListContent';

export default MergeTransactionsListContent;
