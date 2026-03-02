import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {doesContainReservedWord, isValidLegalName} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/LegalNameForm';

type BaseLegalNamePageProps<TFormID extends OnyxFormKey> = {
    children?: ReactNode;
    formID: TFormID;
    submitButtonText?: string;
    onBackButtonPress?: () => void;
    onSubmit: (values: FormOnyxValues<TFormID>) => void;
    validate: (values: FormOnyxValues<TFormID>, translate: LocalizedTranslate) => FormInputErrors<TFormID>;
    headerTitle?: string;
    shouldSaveDraft?: boolean;
    defaultFirstName?: string;
    defaultLastName?: string;
};

/**
 * Appends an error message to the given field, joining with a newline if one already exists.
 */
function appendErrorMessage(errors: FormInputErrors<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>, key: keyof FormOnyxValues<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>, message: string) {
    const existing = errors[key];
    // eslint-disable-next-line no-param-reassign
    errors[key] = existing ? `${existing}\n${message}` : message;
}

/**
 * Validates legal first/last name fields.
 * Shared by LegalNamePage and TravelLegalNamePage.
 */
function validateLegalName(values: FormOnyxValues<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>, translate: LocalizedTranslate): FormInputErrors<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM> {
    const errors: FormInputErrors<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM> = {};
    const firstName = values[INPUT_IDS.LEGAL_FIRST_NAME] ?? '';
    const lastName = values[INPUT_IDS.LEGAL_LAST_NAME] ?? '';

    if (!firstName) {
        errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.fieldRequired');
    } else if (!isValidLegalName(firstName)) {
        errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
    } else if (firstName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
        appendErrorMessage(errors, INPUT_IDS.LEGAL_FIRST_NAME, translate('common.error.characterLimitExceedCounter', firstName.length, CONST.LEGAL_NAME.MAX_LENGTH));
    }
    if (doesContainReservedWord(firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
        appendErrorMessage(errors, INPUT_IDS.LEGAL_FIRST_NAME, translate('personalDetails.error.containsReservedWord'));
    }

    if (!lastName) {
        errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.fieldRequired');
    } else if (!isValidLegalName(lastName)) {
        errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
    } else if (lastName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
        appendErrorMessage(errors, INPUT_IDS.LEGAL_LAST_NAME, translate('common.error.characterLimitExceedCounter', lastName.length, CONST.LEGAL_NAME.MAX_LENGTH));
    }
    if (doesContainReservedWord(lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
        appendErrorMessage(errors, INPUT_IDS.LEGAL_LAST_NAME, translate('personalDetails.error.containsReservedWord'));
    }

    return errors;
}

function BaseLegalNamePage<TFormID extends OnyxFormKey>({
    children,
    formID,
    submitButtonText,
    onBackButtonPress,
    onSubmit,
    validate,
    headerTitle,
    shouldSaveDraft = false,
    defaultFirstName,
    defaultLastName,
}: BaseLegalNamePageProps<TFormID>) {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const legalFirstName = defaultFirstName ?? privatePersonalDetails?.legalFirstName ?? '';
    const legalLastName = defaultLastName ?? privatePersonalDetails?.legalLastName ?? '';

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="LegalNamePage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={headerTitle ?? translate('privatePersonalDetails.legalName')}
                    onBackButtonPress={onBackButtonPress ?? (() => Navigation.goBack())}
                />
                {isLoadingApp ? (
                    <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={formID}
                        validate={validate}
                        onSubmit={onSubmit}
                        submitButtonText={submitButtonText ?? translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb4]}>
                            {children}
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                                name="legalFirstName"
                                label={translate('privatePersonalDetails.legalFirstName')}
                                aria-label={translate('privatePersonalDetails.legalFirstName')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={legalFirstName}
                                shouldSaveDraft={shouldSaveDraft}
                                spellCheck={false}
                                autoCapitalize="words"
                                autoComplete="given-name"
                            />
                        </View>
                        <View>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.LEGAL_LAST_NAME}
                                name="legalLastName"
                                label={translate('privatePersonalDetails.legalLastName')}
                                aria-label={translate('privatePersonalDetails.legalLastName')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={legalLastName}
                                shouldSaveDraft={shouldSaveDraft}
                                spellCheck={false}
                                autoCapitalize="words"
                                autoComplete="family-name"
                            />
                        </View>
                    </FormProvider>
                )}
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export {validateLegalName};
export type {BaseLegalNamePageProps};
export default BaseLegalNamePage;
