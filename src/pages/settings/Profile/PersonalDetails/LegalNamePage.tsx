import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type LegalNamePageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type LegalNamePageProps = LegalNamePageOnyxProps;

const updateLegalName = (values: PrivatePersonalDetails) => {
    PersonalDetails.updateLegalName(values.legalFirstName?.trim() ?? '', values.legalLastName?.trim() ?? '');
};

function LegalNamePage({privatePersonalDetails}: LegalNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    usePrivatePersonalDetails();
    const legalFirstName = privatePersonalDetails?.legalFirstName ?? '';
    const legalLastName = privatePersonalDetails?.legalLastName ?? '';
    const isLoadingPersonalDetails = privatePersonalDetails?.isLoading ?? true;

    const validate = useCallback((values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>) => {
        const errors: Errors = {};

        if (!ValidationUtils.isValidLegalName(values.legalFirstName ?? '')) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'privatePersonalDetails.error.hasInvalidCharacter');
        } else if (!values.legalFirstName) {
            errors.legalFirstName = 'common.error.fieldRequired';
        }
        if (ValidationUtils.doesContainReservedWord(values.legalFirstName ?? '', CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'personalDetails.error.containsReservedWord');
        }
        if ((values.legalFirstName?.length ?? 0) > CONST.LEGAL_NAME.MAX_LENGTH) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', ['common.error.characterLimitExceedCounter', {length: values.legalFirstName?.length, limit: CONST.LEGAL_NAME.MAX_LENGTH}]);
        }

        if (!ValidationUtils.isValidLegalName(values.legalLastName ?? '')) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', 'privatePersonalDetails.error.hasInvalidCharacter');
        } else if (!values.legalLastName) {
            errors.legalLastName = 'common.error.fieldRequired';
        }
        if (ValidationUtils.doesContainReservedWord(values.legalLastName ?? '', CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', 'personalDetails.error.containsReservedWord');
        }
        if ((values.legalLastName?.length ?? 0) > CONST.LEGAL_NAME.MAX_LENGTH) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', ['common.error.characterLimitExceedCounter', {length: values.legalLastName?.length, limit: CONST.LEGAL_NAME.MAX_LENGTH}]);
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
            {isLoadingPersonalDetails ? (
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
                            inputID="legalFirstName"
                            name="lfname"
                            label={translate('privatePersonalDetails.legalFirstName')}
                            aria-label={translate('privatePersonalDetails.legalFirstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalFirstName}
                            maxLength={CONST.LEGAL_NAME.MAX_LENGTH + CONST.SEARCH_MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="legalLastName"
                            name="llname"
                            label={translate('privatePersonalDetails.legalLastName')}
                            aria-label={translate('privatePersonalDetails.legalLastName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalLastName}
                            maxLength={CONST.LEGAL_NAME.MAX_LENGTH + CONST.SEARCH_MAX_LENGTH}
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
})(LegalNamePage);
