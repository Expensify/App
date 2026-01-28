import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName} from '@libs/CardUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
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

type PersonalCardEditNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_NAME>;

function PersonalCardEditNamePage({route}: PersonalCardEditNamePageProps) {
    const {cardID} = route.params;
    const [customCardNames, customCardNamesMetadata] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true, selector: (cardList: OnyxEntry<CardList>) => cardList?.[cardID]});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const defaultValue = customCardNames?.[cardID] ?? getDefaultCardName(cardholder?.firstName);

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM>) => {
        updateAssignedCardName(cardID, values[INPUT_IDS.NAME], defaultValue);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_PERSONAL_CARD_NAME_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.NAME]);
        const length = values.name.length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', length, CONST.STANDARD_LENGTH_LIMIT));
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
                title={translate('workspace.moreFeatures.companyCards.cardNumber')}
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
