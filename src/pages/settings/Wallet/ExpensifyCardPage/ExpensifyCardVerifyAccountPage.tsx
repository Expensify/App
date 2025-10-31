import React, {useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import useRevealCardDetails from './useRevealCardDetails';

type ExpensifyCardVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD_CONFIRM_MAGIC_CODE>;

function ExpensifyCardVerifyAccountPage({
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardVerifyAccountPageProps) {
    const {translate} = useLocalize();
    const [validateError, setValidateError] = useState<Errors>({});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const primaryLogin = account?.primaryLogin ?? '';
    const handleRevealCardDetails = useRevealCardDetails(cardID);

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="actionVerified"
            handleSubmitForm={handleRevealCardDetails}
            validateError={validateError}
            clearError={() => setValidateError({})}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
            }}
        />
    );
}

ExpensifyCardVerifyAccountPage.displayName = 'ExpensifyCardVerifyAccountPage';

export default ExpensifyCardVerifyAccountPage;
