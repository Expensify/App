import React, {useCallback, useMemo} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearPersonalDetailsErrors, setPersonalDetailsAndRevealExpensifyCard} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSubstepValues} from '@pages/MissingPersonalDetails/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useExpensifyCardActions} from './ExpensifyCardContextProvider';

type ExpensifyCardMissingDetailsMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE>;

function ExpensifyCardMissingDetailsMagicCodePage({
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardMissingDetailsMagicCodePageProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: true});

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const validateLoginError = getLatestError(privateDetailsErrors);
    const primaryLogin = account?.primaryLogin ?? '';
    const {setIsCardDetailsLoading, setCardsDetails, setCardsDetailsErrors} = useExpensifyCardActions();

    const clearError = useCallback(() => {
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    }, [validateCodeAction?.errorFields, validateLoginError]);

    const values = useMemo(() => normalizeCountryCode(getSubstepValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
                ...prevState,
                [cardID]: true,
            }));

            setPersonalDetailsAndRevealExpensifyCard(values, validateCode, countryCode, Number.parseInt(cardID, 10))
                .then((value) => {
                    setCardsDetails((prevState) => ({...prevState, [cardID]: value}));
                    setCardsDetailsErrors((prevState) => ({
                        ...prevState,
                        [cardID]: '',
                    }));
                    Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
                })
                .catch((error: string) => {
                    setCardsDetailsErrors((prevState) => ({
                        ...prevState,
                        [cardID]: error,
                    }));
                    Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
                })
                .finally(() => {
                    setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [cardID]: false}));
                });
        },
        [cardID, countryCode, setCardsDetails, setCardsDetailsErrors, setIsCardDetailsLoading, values],
    );

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            clearError={clearError}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS.getRoute(cardID));
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

export default ExpensifyCardMissingDetailsMagicCodePage;
