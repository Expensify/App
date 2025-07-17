import React, {useCallback} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import MergeTransactionsListContent from './MergeTransactionsListContent';

type MergeTransactionsListProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.LIST_PAGE>;

function MergeTransactionsList({route}: MergeTransactionsListProps) {
    const {translate} = useLocalize();
    const {transactionID, backTo} = route.params;

    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});

    const goBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack();
    }, [backTo]);

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
                <MergeTransactionsListContent
                    transactionID={transactionID}
                    mergeTransaction={mergeTransaction}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MergeTransactionsList.displayName = 'MergeTransactionsList';

export default MergeTransactionsList;
