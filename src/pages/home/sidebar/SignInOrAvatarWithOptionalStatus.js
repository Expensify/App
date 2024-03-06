/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import * as Session from '@userActions/Session';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import SignInButton from './SignInButton';

const propTypes = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,
};

const defaultProps = {
    isCreateMenuOpen: false,
};

function SignInOrAvatarWithOptionalStatus({isCreateMenuOpen}) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
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
export default SignInOrAvatarWithOptionalStatus;
