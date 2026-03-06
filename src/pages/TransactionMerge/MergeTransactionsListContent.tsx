import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, setupMergeTransactionData, setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {fillMissingReceiptSource} from '@libs/MergeTransactionUtils';
import {getTransactionReportName, isIOUReport} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import tokenizedSearch from '@libs/tokenizedSearch';
import {getAmount, getCreated, getCurrency, getDescription, getMerchant, isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type Transaction from '@src/types/onyx/Transaction';
import MergeTransactionItem from './MergeTransactionItem';

type MergeTransactionsListContentProps = {
    transactionID: string;
    mergeTransaction: OnyxEntry<MergeTransaction>;
    isOnSearch?: boolean;
};

type MergeTransactionListItemType = Transaction & ListItem;

function MergeTransactionsListContent({transactionID, mergeTransaction, isOnSearch}: MergeTransactionsListContentProps) {
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserLogin = session?.email;
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const {isOffline} = useNetwork();

    const eligibleTransactions = mergeTransaction?.eligibleTransactions;
    const {targetTransaction, sourceTransaction, targetTransactionReport, sourceTransactionReport} = useMergeTransactions({mergeTransaction});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${targetTransactionReport?.policyID}`);

    useEffect(() => {
        // If the eligible transactions are already loaded, don't fetch them again
        if (Array.isArray(mergeTransaction?.eligibleTransactions) || !targetTransaction) {
            return;
        }

        getTransactionsForMerging({
            isOffline,
            targetTransaction,
            transactions,
            policy,
            report: targetTransactionReport,
            currentUserLogin,
        });
    }, [transactions, isOffline, mergeTransaction?.eligibleTransactions, policy, targetTransactionReport, currentUserLogin, targetTransaction]);

    const data = !eligibleTransactions
        ? []
        : eligibleTransactions
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

    const shouldShowTextInput = data.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const filteredData =
        !debouncedSearchValue.trim() || !shouldShowTextInput
            ? data
            : tokenizedSearch(data, debouncedSearchValue, (transaction) => {
                  const searchableFields: string[] = [];
                  const merchant = getMerchant(transaction);
                  if (merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT) {
                      searchableFields.push(merchant);
                  }
                  const description = getDescription(transaction);
                  if (description.trim()) {
                      searchableFields.push(description);
                  }
                  const amount = getAmount(transaction);
                  const currency = getCurrency(transaction);
                  searchableFields.push(convertToDisplayString(amount, currency));
                  searchableFields.push((amount / 100).toString());
                  return searchableFields;
              });

    const headerMessage = debouncedSearchValue.trim() && filteredData.length === 0 ? translate('common.noResultsFound') : '';

    const textInputOptions = {
        value: searchValue,
        label: shouldShowTextInput ? translate('common.search') : undefined,
        onChangeText: setSearchValue,
        headerMessage,
    };

    const handleSelectRow = (item: MergeTransactionListItemType) => {
        // Clear the merge transaction data when select a new source transaction to merge
        setupMergeTransactionData(transactionID, {
            targetTransactionID: transactionID,
            sourceTransactionID: item.transactionID,
            eligibleTransactions: mergeTransaction?.eligibleTransactions,
        });
    };

    const transactionDisplayName = targetTransaction
        ? getTransactionReportName({
              reportAction: undefined,
              transactions: [targetTransaction],
              reports: targetTransactionReport ? [targetTransactionReport] : [],
          })
        : '';

    const headerContent = (
        <View style={[styles.renderHTML, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.flexRow]}>
            <RenderHTML
                html={translate('transactionMerge.listPage.selectTransactionToMerge', {
                    reportName: transactionDisplayName,
                })}
            />
        </View>
    );

    const subTitleContent = (
        <View style={[styles.renderHTML, styles.textNormal]}>
            <RenderHTML html={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')} />
        </View>
    );

    const handleConfirm = () => {
        if (!sourceTransaction || !targetTransaction) {
            return;
        }

        const reports = targetTransactionReport && sourceTransactionReport ? [targetTransactionReport, sourceTransactionReport] : undefined;
        setupMergeTransactionDataAndNavigate(transactionID, [targetTransaction, sourceTransaction], localeCompare, reports, true, isOnSearch);
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.continue'),
        style: styles.justifyContentCenter,
        isDisabled: !mergeTransaction?.sourceTransactionID,
        onConfirm: handleConfirm,
    };

    const filteredTransactions = eligibleTransactions?.filter((transaction) => {
        return !isIOUReport(transaction?.reportID);
    });

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MergeTransactionsListContent',
        isEligibleTransactionsLoaded: eligibleTransactions !== undefined,
    };

    if (filteredTransactions?.length === 0) {
        return (
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                <EmptyStateComponent
                    cardStyles={[styles.appBG]}
                    cardContentStyles={[styles.p0]}
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
            data={filteredData}
            onSelectRow={handleSelectRow}
            ListItem={MergeTransactionItem}
            customListHeader={headerContent}
            confirmButtonOptions={confirmButtonOptions}
            customLoadingPlaceholder={
                <MergeExpensesSkeleton
                    fixedNumItems={3}
                    reasonAttributes={reasonAttributes}
                />
            }
            shouldShowLoadingPlaceholder={!eligibleTransactions}
            textInputOptions={textInputOptions}
            shouldShowTextInput={shouldShowTextInput}
        />
    );
}

export default MergeTransactionsListContent;
