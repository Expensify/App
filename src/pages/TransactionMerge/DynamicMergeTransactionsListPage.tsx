import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

import MergeTransactionsListContent from './MergeTransactionsListContent';

type DynamicMergeTransactionsListPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DYNAMIC_LIST_PAGE>;

function DynamicMergeTransactionsListPage({route}: DynamicMergeTransactionsListPageProps) {
    const {translate} = useLocalize();
    const {transactionID} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`);

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'TransactionMerge.MergeTransactionsListPage',
            isLoadingMergeTransaction: isLoadingOnyxValue(mergeTransactionMetadata),
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            testID="DynamicMergeTransactionsListPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.listPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack();
                    }}
                />
                <MergeTransactionsListContent
                    transactionID={transactionID}
                    mergeTransaction={mergeTransaction}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicMergeTransactionsListPage;
