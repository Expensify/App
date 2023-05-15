import _ from 'underscore';
import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';

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
    const legalFirstName = lodashGet(props.privatePersonalDetails, 'legalFirstName', '');
    const legalLastName = lodashGet(props.privatePersonalDetails, 'legalLastName', '');
    const translate = props.translate;

    const validate = useCallback(
        (values) => {
            const errors = {};

            if (!ValidationUtils.isValidLegalName(values.legalFirstName)) {
                errors.legalFirstName = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (_.isEmpty(values.legalFirstName)) {
                errors.legalFirstName = translate('common.error.fieldRequired');
            }

            if (!ValidationUtils.isValidLegalName(values.legalLastName)) {
                errors.legalLastName = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (_.isEmpty(values.legalLastName)) {
                errors.legalLastName = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('privatePersonalDetails.legalName')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.LEGAL_NAME_FORM}
                validate={validate}
                onSubmit={updateLegalName}
                submitButtonText={props.translate('common.save')}
                enabledWhenOffline
            >
                <View style={[styles.mb4]}>
                    <TextInput
                        inputID="legalFirstName"
                        name="lfname"
                        label={props.translate('privatePersonalDetails.legalFirstName')}
                        defaultValue={legalFirstName}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                    />
                </View>
                <View>
                    <TextInput
                        inputID="legalLastName"
                        name="llname"
                        label={props.translate('privatePersonalDetails.legalLastName')}
                        defaultValue={legalLastName}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

LegalNamePage.propTypes = propTypes;
LegalNamePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(LegalNamePage);
