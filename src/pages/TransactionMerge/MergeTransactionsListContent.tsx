import React, {useCallback, useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, setMergeTransactionKey} from '@libs/actions/Transaction';
import CONST from '@src/CONST';
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

    useEffect(() => {
        getTransactionsForMerging(transactionID);
    }, [transactionID]);

    const sections = useMemo(() => {
        return [
            {
                data: (mergeTransaction?.eligibleTransactions ?? []).map((transaction) => ({
                    ...transaction,
                    keyForList: transaction.transactionID,
                    isSelected: transaction.transactionID === mergeTransaction?.sourceTransactionID,
                    errors: transaction.errors as Errors | undefined,
                })),
                shouldShow: true,
            },
        ];
    }, [mergeTransaction]);

    const handleSelectRow = useCallback(
        (item: MergeTransactionListItemType) => {
            setMergeTransactionKey(transactionID, {
                sourceTransactionID: item.transactionID,
            });
        },
        [transactionID],
    );

    if (mergeTransaction?.eligibleTransactions?.length === 0) {
        return (
            <EmptyStateComponent
                cardStyles={[styles.appBG]}
                cardContentStyles={[styles.pt5, styles.pb0]}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                headerMedia={LottieAnimations.GenericEmptyState}
                title={translate('transactionMerge.listPage.noEligibleExpenseFound')}
                subtitle={translate('transactionMerge.listPage.noEligibleExpenseFoundSubtitle')}
                headerStyles={[styles.emptyStateMoneyRequestReport]}
                lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                headerContentStyles={styles.emptyStateFolderWebStyles}
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
            onSelectRow={handleSelectRow}
            showLoadingPlaceholder
            LoadingPlaceholderComponent={MergeExpensesSkeleton}
            fixedNumItemsForLoader={3}
            onConfirm={console.log}
        />
    );
}

MergeTransactionsListContent.displayName = 'MergeTransactionsListContent';

export default MergeTransactionsListContent;
