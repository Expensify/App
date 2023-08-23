import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import NewDatePicker from '../../../../components/NewDatePicker';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Form from '../../../../components/Form';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as User from '../../../../libs/actions/User';
import compose from '../../../../libs/compose';
import styles from '../../../../styles/styles';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        dob: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        dob: '',
    },
};

function CustomClearAfterPage({translate, customStatus, personalDetails}) {
    usePrivatePersonalDetails();
    const cleanAfter = lodashGet(personalDetails, 'status.cleanAfter', '');
    const customDateTemporary = lodashGet(customStatus, 'customDateTemporary', '');
    const defaultValue = cleanAfter || customDateTemporary;

    const onSubmit = (v) => {
        User.updateDraftCustomStatus({customDateTemporary: v.dob});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.dob')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldUseDefaultValue
            >
                <NewDatePicker
                    inputID="dob"
                    label={translate('common.date')}
                    defaultValue={defaultValue}
                    minDate={moment().toDate()}
                />
            </Form>
        </ScreenWrapper>
    );
}

CustomClearAfterPage.propTypes = propTypes;
CustomClearAfterPage.defaultProps = defaultProps;
CustomClearAfterPage.displayName = 'CustomClearAfterPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
        clearDateForm: {
            key: `${ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM}Draft`,
        },
    }),
)(CustomClearAfterPage);
