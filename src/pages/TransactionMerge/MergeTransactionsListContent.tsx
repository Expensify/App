import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging} from '@libs/actions/Transaction';
import CONST from '@src/CONST';
import type {MergeTransaction} from '@src/types/onyx';

type MergeTransactionsListContentProps = {
    transactionID: string;
    mergeTransaction: OnyxEntry<MergeTransaction>;
};

function MergeTransactionsListContent({transactionID, mergeTransaction}: MergeTransactionsListContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    useEffect(() => {
        getTransactionsForMerging(transactionID);
    }, [transactionID]);

    if (!mergeTransaction?.eligibleTransactions) {
        return <MergeExpensesSkeleton />;
    }

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

    return null;
}

MergeTransactionsListContent.displayName = 'MergeTransactionsListContent';

export default MergeTransactionsListContent;
