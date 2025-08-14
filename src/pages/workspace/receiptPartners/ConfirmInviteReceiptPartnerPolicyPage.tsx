import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function ConfirmInviteReceiptPartnerPolicyPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleGotIt = () => {
        Navigation.dismissModal();
    };

    return (
        <ScreenWrapper testID={ConfirmInviteReceiptPartnerPolicyPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.receiptPartners.allSet')}
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <ConfirmationPage
                illustration={Illustrations.ToddInCar}
                heading={translate('workspace.receiptPartners.readyToRoll')}
                description={translate('workspace.receiptPartners.takeBusinessRideMessage')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={handleGotIt}
                descriptionStyle={styles.colorMuted}
            />
        </ScreenWrapper>
    );
}

ConfirmInviteReceiptPartnerPolicyPage.displayName = 'ConfirmInviteReceiptPartnerPolicyPage';

export default ConfirmInviteReceiptPartnerPolicyPage;
