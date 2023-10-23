/* eslint-disable rulesdir/onyx-props-must-have-default */
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../personalDetailsPropType';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import SignInButton from './SignInButton';
import * as Session from '../../../libs/actions/Session';
import Permissions from '../../../libs/Permissions';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';

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
