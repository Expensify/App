import React, {useState} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {revealVirtualCardDetails} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import useExpensifyCardContext from './useExpensifyCardContext';

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
    const {setIsCardDetailsLoading, setCardsDetails, setCardsDetailsErrors} = useExpensifyCardContext();

    const handleRevealCardDetails = (validateCode: string) => {
        setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
            ...prevState,
            [cardID]: true,
        }));
        // We can't store the response in Onyx for security reasons.
        // That is why this action is handled manually and the response is stored in a local state.
        // Hence eslint disable here.
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        revealVirtualCardDetails(Number.parseInt(cardID, 10), validateCode)
            .then((value) => {
                setCardsDetails((prevState: Record<number, ExpensifyCardDetails | null>) => ({...prevState, [cardID]: value}));
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [cardID]: '',
                }));
                Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
            })
            .catch((error: string) => {
                // Displaying magic code errors is handled in the modal, no need to set it on the card
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [cardID]: error,
                }));
            })
            .finally(() => {
                setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [cardID]: false}));
            });
    };

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="revealExpensifyCardDetails"
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
