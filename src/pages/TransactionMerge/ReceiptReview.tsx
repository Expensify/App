import React from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type SCREENS from '@src/SCREENS';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@libs/Navigation/Navigation';

type ReceiptReviewProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE>;

function ReceiptReview({route}: ReceiptReviewProps) {
    const {translate} = useLocalize();

    const {transactionID, backTo} = route.params;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});

    return (
        <ScreenWrapper
            testID={ReceiptReview.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!transaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.receiptPage.header')}
                    onBackButtonPress={() => {
                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }
                        Navigation.goBack();
                    }}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReceiptReview.displayName = 'ReceiptReview';
    
export default ReceiptReview;