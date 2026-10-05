import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardNameError, getCardNameErrorMessage, getDefaultCardName} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import StringUtils from '@libs/StringUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {updateAssignedCardName} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditPersonalCardNameForm';
import type {CardList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {cardByIdSelector} from '@selectors/Card';
import React, {useCallback} from 'react';

type PersonalCardEditNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_NAME>;

function PersonalCardEditNamePage({route}: PersonalCardEditNamePageProps) {
    const {cardID} = route.params;
    const [customCardNames, customCardNamesMetadata] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const cardSelector = useCallback((cardList: OnyxEntry<CardList>) => cardByIdSelector(cardID)(cardList), [cardID]);
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardSelector});
    const [cardholder] = usePersonalDetail(card?.accountID);
    const isCSVImportedPersonalCard = !!card && (card.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD || card.bank.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV));
    const defaultValue =
        customCardNames?.[cardID] ?? (isCSVImportedPersonalCard ? card?.nameValuePairs?.cardTitle : undefined) ?? card?.cardName ?? getDefaultCardName(cardholder?.firstName);

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM>) => {
        updateAssignedCardName(cardID, StringUtils.sanitizeName(values[INPUT_IDS.NAME]), defaultValue);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM> = {};
        const error = getCardNameError(values.name);

        if (error) {
            errors[INPUT_IDS.NAME] = getCardNameErrorMessage(translate, error, values.name);
        }

        return errors;
    };

    if (isLoadingOnyxValue(customCardNamesMetadata)) {
        return null;
    }

    return (
        <ScreenWrapper
            testID="PersonalCardEditNamePage"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.companyCards.cardName')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID))}
            />
            <Text style={[styles.mh5, styles.mt3, styles.mb5]}>{translate('workspace.moreFeatures.companyCards.giveItNameInstruction')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM}
                submitButtonText={translate('common.save')}
                onSubmit={submit}
                style={[styles.flex1, styles.mh5]}
                enabledWhenOffline
                validate={validate}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME}
                    label={translate('workspace.moreFeatures.companyCards.cardName')}
                    aria-label={translate('workspace.moreFeatures.companyCards.cardName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValue}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

PersonalCardEditNamePage.displayName = 'PersonalCardEditNamePage';

export default PersonalCardEditNamePage;
