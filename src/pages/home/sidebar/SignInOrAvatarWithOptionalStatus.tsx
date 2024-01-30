import React from 'react';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import * as Session from '@userActions/Session';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import SignInButton from './SignInButton';

type SignInOrAvatarWithOptionalStatusProps = {
    isCreateMenuOpen?: boolean;
} & WithCurrentUserPersonalDetailsProps;

function SignInOrAvatarWithOptionalStatus({currentUserPersonalDetails, isCreateMenuOpen}: SignInOrAvatarWithOptionalStatusProps) {
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';

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

SignInOrAvatarWithOptionalStatus.displayName = 'SignInOrAvatarWithOptionalStatus';
export default withCurrentUserPersonalDetails(SignInOrAvatarWithOptionalStatus);
