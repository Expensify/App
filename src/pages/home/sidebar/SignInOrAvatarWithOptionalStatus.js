/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import * as Session from '@userActions/Session';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import SignInButton from './SignInButton';

const propTypes = {
    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,
};

const defaultProps = {
    isCreateMenuOpen: false,
    currentUserPersonalDetails: {
        status: {emojiCode: ''},
    },
};

function SignInOrAvatarWithOptionalStatus({currentUserPersonalDetails, isCreateMenuOpen}) {
    const emojiStatus = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');

    if (Session.isAnonymousUser()) {
        return <SignInButton />;
    }
    if (emojiStatus) {
        return (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isCreateMenuOpen={isCreateMenuOpen}
            />
        );
    }
    return <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />;
}

SignInOrAvatarWithOptionalStatus.propTypes = propTypes;
SignInOrAvatarWithOptionalStatus.defaultProps = defaultProps;
SignInOrAvatarWithOptionalStatus.displayName = 'SignInOrAvatarWithOptionalStatus';
export default withCurrentUserPersonalDetails(SignInOrAvatarWithOptionalStatus);
