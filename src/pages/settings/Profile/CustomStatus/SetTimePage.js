import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withCurrentUserPersonalDetails from '../../../../components/withCurrentUserPersonalDetails';
import FullscreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import TimePicker from '../../../../components/TimePicker';
import Form from '../../../../components/Form';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import useLocalize from '../../../../hooks/useLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as User from '../../../../libs/actions/User';
import DateUtils from '../../../../libs/DateUtils';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import compose from '../../../../libs/compose';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';

const propTypes = {
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

function SetTimePage({translate, privatePersonalDetails, customStatus, currentUserPersonalDetails}) {
    usePrivatePersonalDetails();
    const localize = useLocalize();
    const clearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');
    const customDateTemporary = lodashGet(customStatus, 'customDateTemporary', '');
    const draftClearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = ({timePicker}, amPmValue) => {
        const timeToUse = DateUtils.combineDateAndTime(`${timePicker} ${amPmValue}`, customDateTemporary);

        User.updateDraftCustomStatus({customDateTemporary: timeToUse});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };
    const validate = (v) => {
        const error = {};

        if (!ValidationUtils.isTimeAtLeastOneMinuteInFuture(v.timePicker, customDateTemporary || draftClearAfter || clearAfter)) {
            error.timePicker = localize.translate('common.error.timeInvalid');
        }

        return error;
    };

    if (lodashGet(privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('statusPage.time')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_TIME_FORM}
                onSubmit={onSubmit}
                submitButtonText={'SAVE'}
                validate={validate}
                enabledWhenOffline
                shouldUseDefaultValue
            >
                <TimePicker
                    inputID="timePicker"
                    defaultValue={customDateTemporary || draftClearAfter || clearAfter}
                />
            </Form>
        </ScreenWrapper>
    );
}

SetTimePage.propTypes = propTypes;
SetTimePage.defaultProps = defaultProps;
SetTimePage.displayName = 'SetTimePage';

export default compose(
    withCurrentUserPersonalDetails,
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(SetTimePage);
