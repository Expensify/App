import React from 'react';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PendingBank} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAddNewCompanyCardStepAndData} from '@libs/actions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function PlaidConnectionStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const isUSCountry = addNewCard?.data?.selectedCountry === CONST.COUNTRY.US;

    const handleBackButtonPress = () => {
        setAddNewCompanyCardStepAndData({step: isUSCountry ? CONST.COMPANY_CARDS.STEP.SELECT_BANK : CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    return (
        <ScreenWrapper
            testID={PlaidConnectionStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <BlockingView
                    title={translate('bankAccount.connectOnlineWithPlaid')}
                    icon={PendingBank}
                    iconWidth={styles.pendingBankCardIllustration.width}
                    iconHeight={styles.pendingBankCardIllustration.height}
                    addBottomSafeAreaPadding
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

PlaidConnectionStep.displayName = 'PlaidConnectionStep';

export default PlaidConnectionStep;
