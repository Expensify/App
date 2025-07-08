import React, {useCallback, useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import MergeExpensesSkeleton from '@components/Skeletons/MergeExpensesSkeleton';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsForMerging} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type MergeTransactionsListProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.LIST_PAGE>;

function MergeTransactionsList({route}: MergeTransactionsListProps) {
    const {translate} = useLocalize();
    const {transactionID, backTo} = route.params;
    const styles = useThemeStyles();

    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});

    const goBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack();
    }, [backTo]);

    // Load transactions
    useEffect(() => {
        getTransactionsForMerging(transactionID);
    }, [transactionID]);

    if (!mergeTransaction?.eligibleTransactions) {
        return (
            <ScreenWrapper
                testID={MergeTransactionsList.displayName}
                shouldEnableMaxHeight
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('transactionMerge.listPage.header')}
                    onBackButtonPress={goBack}
                />
                <MergeExpensesSkeleton />
            </ScreenWrapper>
        );
    }

    if (mergeTransaction?.eligibleTransactions?.length === 0) {
        return (
            <ScreenWrapper
                testID={MergeTransactionsList.displayName}
                shouldEnableMaxHeight
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('transactionMerge.listPage.header')}
                    onBackButtonPress={goBack}
                />
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
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={MergeTransactionsList.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.listPage.header')}
                    onBackButtonPress={goBack}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MergeTransactionsList.displayName = 'MergeTransactionsList';

export default MergeTransactionsList;
