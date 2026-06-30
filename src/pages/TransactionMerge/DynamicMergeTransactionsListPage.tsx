import {useNavigation} from '@react-navigation/native';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MergeTransactionsListContent from './MergeTransactionsListContent';

type DynamicMergeTransactionsListPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DYNAMIC_LIST_PAGE>;

function DynamicMergeTransactionsListPage({route}: DynamicMergeTransactionsListPageProps) {
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MERGE_TRANSACTION_LIST.path);
    const {transactionID, isOnSearch} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`);

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'TransactionMerge.DynamicMergeTransactionsListPage',
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
                        if (navigation.canGoBack()) {
                            Navigation.goBack();
                            return;
                        }
                        Navigation.goBack(backPath, {compareParams: false});
                    }}
                />
                <MergeTransactionsListContent
                    transactionID={transactionID}
                    mergeTransaction={mergeTransaction}
                    isOnSearch={isOnSearch}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicMergeTransactionsListPage;
