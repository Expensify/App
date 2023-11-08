import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import participantPropTypes from '@components/participantPropTypes';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The acountID of the user */
            accountID: PropTypes.string.isRequired,
        }),
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Indicates whether the app is loading initial data */
    isLoadingApp: PropTypes.bool,
};

const defaultProps = {
    personalDetails: {},
    isLoadingApp: true,
};

function ProfileAvatar(props) {
    const personalDetail = props.personalDetails[props.route.params.accountID];
    const avatarURL = lodashGet(personalDetail, 'avatar', '');
    const accountID = lodashGet(personalDetail, 'accountID', '');

    return (
        <AttachmentModal
            headerTitle={lodashGet(personalDetail, 'displayName', '')}
            defaultOpen
            source={UserUtils.getAvatar(avatarURL, accountID)}
            onModalClose={() => {
                Navigation.goBack();
            }}
            isLoading={props.isLoadingApp && _.isEmpty(props.personalDetails)}
        />
    );
}

ProfileAvatar.propTypes = propTypes;
ProfileAvatar.defaultProps = defaultProps;
ProfileAvatar.displayName = 'ProfileAvatar';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(ProfileAvatar);
