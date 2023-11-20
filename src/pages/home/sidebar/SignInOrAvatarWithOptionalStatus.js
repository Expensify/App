/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import compose from '@libs/compose';
import Permissions from '@libs/Permissions';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import SignInButton from './SignInButton';

const propTypes = {
    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    betas: [],
    isCreateMenuOpen: false,
    currentUserPersonalDetails: {
        status: {emojiCode: ''},
    },
};

function SignInOrAvatarWithOptionalStatus({currentUserPersonalDetails, isCreateMenuOpen, betas}) {
    const statusEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const emojiStatus = Permissions.canUseCustomStatus(betas) ? statusEmojiCode : '';

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
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SignInOrAvatarWithOptionalStatus);
