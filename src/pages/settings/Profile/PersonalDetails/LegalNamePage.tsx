import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/LegalNameForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type LegalNamePageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
};

type LegalNamePageProps = LegalNamePageOnyxProps;

const updateLegalName = (values: PrivatePersonalDetails) => {
    PersonalDetails.updateLegalName(values.legalFirstName?.trim() ?? '', values.legalLastName?.trim() ?? '');
};

function LegalNamePage({privatePersonalDetails, isLoadingApp = true}: LegalNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const legalFirstName = privatePersonalDetails?.legalFirstName ?? '';
    const legalLastName = privatePersonalDetails?.legalLastName ?? '';

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>) => {
        const errors: Errors = {};

        if (typeof values.legalFirstName === 'string') {
            if (!ValidationUtils.isValidLegalName(values.legalFirstName)) {
                ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'privatePersonalDetails.error.hasInvalidCharacter');
            } else if (!values.legalFirstName) {
                errors.legalFirstName = 'common.error.fieldRequired';
            } else if (values.legalFirstName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                ErrorUtils.addErrorMessage(errors, 'legalFirstName', [
                    'common.error.characterLimitExceedCounter',
                    {length: values.legalFirstName.length, limit: CONST.LEGAL_NAME.MAX_LENGTH},
                ]);
            }
            if (ValidationUtils.doesContainReservedWord(values.legalFirstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'personalDetails.error.containsReservedWord');
            }
        }

        if (typeof values.legalLastName === 'string') {
            if (!ValidationUtils.isValidLegalName(values.legalLastName)) {
                ErrorUtils.addErrorMessage(errors, 'legalLastName', 'privatePersonalDetails.error.hasInvalidCharacter');
            } else if (!values.legalLastName) {
                errors.legalLastName = 'common.error.fieldRequired';
            } else if (values.legalLastName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                ErrorUtils.addErrorMessage(errors, 'legalLastName', ['common.error.characterLimitExceedCounter', {length: values.legalLastName.length, limit: CONST.LEGAL_NAME.MAX_LENGTH}]);
            }
            if (ValidationUtils.doesContainReservedWord(values.legalLastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, 'legalLastName', 'personalDetails.error.containsReservedWord');
            }
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={LegalNamePage.displayName}
        >
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
                    onSubmit={updateLegalName}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                            name="lfname"
                            label={translate('privatePersonalDetails.legalFirstName')}
                            aria-label={translate('privatePersonalDetails.legalFirstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalFirstName}
                            spellCheck={false}
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LEGAL_LAST_NAME}
                            name="llname"
                            label={translate('privatePersonalDetails.legalLastName')}
                            aria-label={translate('privatePersonalDetails.legalLastName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalLastName}
                            spellCheck={false}
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

LegalNamePage.displayName = 'LegalNamePage';

export default withOnyx<LegalNamePageProps, LegalNamePageOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(LegalNamePage);
