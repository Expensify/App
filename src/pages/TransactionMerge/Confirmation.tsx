import React from 'react';
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

type ConfirmationProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE>;

function Confirmation({route}: ConfirmationProps) {
    const {translate} = useLocalize();

    const {transactionID, backTo} = route.params;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!transaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.confirmationPage.header')}
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

Confirmation.displayName = 'Confirmation';

export default Confirmation;
