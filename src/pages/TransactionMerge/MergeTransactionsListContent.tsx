import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging, setMergeTransactionKey} from '@libs/actions/Transaction';
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
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {canBeMissing: true});

    useEffect(() => {
        getTransactionsForMerging(transactionID);
    }, [transactionID]);

    const sections = useMemo(() => {
        return [
            {
                data: (mergeTransaction?.eligibleTransactions ?? []).map((eligibleTransaction) => ({
                    ...eligibleTransaction,
                    keyForList: eligibleTransaction.transactionID,
                    isSelected: eligibleTransaction.transactionID === mergeTransaction?.sourceTransactionID,
                    errors: eligibleTransaction.errors as Errors | undefined,
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

    const headerContent = useMemo(
        () => (
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabel, styles.minHeight5]}>
                    <RenderHTML html={translate('transactionMerge.listPage.selectTransactionToMerge')} />
                    <Text style={[styles.textBold]}> {report?.reportName ?? ''}</Text>
                </Text>
            </View>
        ),
        [report?.reportName, translate, styles.ph5, styles.pb5, styles.textLabel, styles.minHeight5, styles.textBold],
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
            headerContent={headerContent}
            onConfirm={console.log}
        />
    );
}

MergeTransactionsListContent.displayName = 'MergeTransactionsListContent';

export default MergeTransactionsListContent;
