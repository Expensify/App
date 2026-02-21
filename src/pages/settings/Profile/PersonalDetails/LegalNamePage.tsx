import React, {useCallback} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {doesContainReservedWord} from '@libs/ValidationUtils';
import {updateLegalName as updateLegalNamePersonalDetails} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/LegalNameForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

const updateLegalName = (
    values: PrivatePersonalDetails,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'>,
) => {
    updateLegalNamePersonalDetails(values.legalFirstName?.trim() ?? '', values.legalLastName?.trim() ?? '', formatPhoneNumber, currentUserPersonalDetail);
};

function LegalNamePage() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const legalFirstName = privatePersonalDetails?.legalFirstName ?? '';
    const legalLastName = privatePersonalDetails?.legalLastName ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>) => {
            const errors: Errors = {};

            if (typeof values.legalFirstName === 'string') {
                if (!values.legalFirstName) {
                    errors.legalFirstName = translate('common.error.fieldRequired');
                } else if (values.legalFirstName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                    addErrorMessage(errors, 'legalFirstName', translate('common.error.characterLimitExceedCounter', values.legalFirstName.length, CONST.LEGAL_NAME.MAX_LENGTH));
                }
                if (doesContainReservedWord(values.legalFirstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                    addErrorMessage(errors, 'legalFirstName', translate('personalDetails.error.containsReservedWord'));
                }
            }

            if (typeof values.legalLastName === 'string') {
                if (!values.legalLastName) {
                    errors.legalLastName = translate('common.error.fieldRequired');
                } else if (values.legalLastName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                    addErrorMessage(errors, 'legalLastName', translate('common.error.characterLimitExceedCounter', values.legalLastName.length, CONST.LEGAL_NAME.MAX_LENGTH));
                }
                if (doesContainReservedWord(values.legalLastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                    addErrorMessage(errors, 'legalLastName', translate('personalDetails.error.containsReservedWord'));
                }
            }

            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="LegalNamePage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('privatePersonalDetails.legalName')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                {isLoadingApp ? (
                    <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.LEGAL_NAME_FORM}
                        validate={validate}
                        onSubmit={(values) =>
                            updateLegalName(values, formatPhoneNumber, {
                                firstName: currentUserPersonalDetails.firstName,
                                lastName: currentUserPersonalDetails.lastName,
                                accountID: currentUserPersonalDetails.accountID,
                                email: currentUserPersonalDetails.email,
                            })
                        }
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb4]}>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                                name="legalFirstName"
                                label={translate('privatePersonalDetails.legalFirstName')}
                                aria-label={translate('privatePersonalDetails.legalFirstName')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={legalFirstName}
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

export default LegalNamePage;
