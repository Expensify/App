import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
    },
};

const updateLegalName = (values) => {
    PersonalDetails.updateLegalName(values.legalFirstName.trim(), values.legalLastName.trim());
};

function LegalNamePage(props) {
    const styles = useThemeStyles();
    usePrivatePersonalDetails();
    const legalFirstName = lodashGet(props.privatePersonalDetails, 'legalFirstName', '');
    const legalLastName = lodashGet(props.privatePersonalDetails, 'legalLastName', '');
    const isLoadingPersonalDetails = lodashGet(props.privatePersonalDetails, 'isLoading', true);

    const validate = useCallback((values) => {
        const errors = {};

        if (!ValidationUtils.isValidLegalName(values.legalFirstName)) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'privatePersonalDetails.error.hasInvalidCharacter');
        } else if (_.isEmpty(values.legalFirstName)) {
            errors.legalFirstName = 'common.error.fieldRequired';
        } else if (values.legalFirstName.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', ['common.error.characterLimitExceedCounter', {length: values.legalFirstName.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.legalFirstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'legalFirstName', 'personalDetails.error.containsReservedWord');
        }

        if (!ValidationUtils.isValidLegalName(values.legalLastName)) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', 'privatePersonalDetails.error.hasInvalidCharacter');
        } else if (_.isEmpty(values.legalLastName)) {
            errors.legalLastName = 'common.error.fieldRequired';
        } else if (values.legalLastName.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', ['common.error.characterLimitExceedCounter', {length: values.legalLastName.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.legalLastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'legalLastName', 'personalDetails.error.containsReservedWord');
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
                title={props.translate('privatePersonalDetails.legalName')}
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
                    submitButtonText={props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="legalFirstName"
                            name="lfname"
                            label={props.translate('privatePersonalDetails.legalFirstName')}
                            aria-label={props.translate('privatePersonalDetails.legalFirstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalFirstName}
                            spellCheck={false}
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="legalLastName"
                            name="llname"
                            label={props.translate('privatePersonalDetails.legalLastName')}
                            aria-label={props.translate('privatePersonalDetails.legalLastName')}
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

LegalNamePage.propTypes = propTypes;
LegalNamePage.defaultProps = defaultProps;
LegalNamePage.displayName = 'LegalNamePage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(LegalNamePage);
