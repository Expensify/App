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
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as User from '../../../../libs/actions/User';
import DateUtils from '../../../../libs/DateUtils';
import compose from '../../../../libs/compose';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';

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

    const clearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');
    const customDateTemporary = lodashGet(customStatus, 'customDateTemporary', '');
    const draftClearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmitButtonPress = useCallback((time, amPmValue) => {
        const timeToUse = DateUtils.setTimeOrDefaultToTomorrow(`${time} ${amPmValue}`, customDateTemporary);

        User.updateDraftCustomStatus({customDateTemporary: timeToUse});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    }, [customDateTemporary]);


    if (lodashGet(privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }

    const customStatusTime = DateUtils.extractTime(customDateTemporary || draftClearAfter || clearAfter);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.dob')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <TimePicker
                inputID="timePicker"
                defaultValue={customStatusTime}
                onSubmitButtonPress={onSubmitButtonPress}
            />
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
