/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';

const propTypes = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,

    isSelected: PropTypes.bool,
};

const defaultProps = {
    isCreateMenuOpen: false,
    isSelected: false,
};

function BottomTabAvatar({isCreateMenuOpen, isSelected}) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');

    if (emojiStatus) {
        return (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isCreateMenuOpen={isCreateMenuOpen}
                isSelected={isSelected}
            />
        );
    }
    return (
        <PressableAvatarWithIndicator
            isCreateMenuOpen={isCreateMenuOpen}
            isSelected={isSelected}
        />
    );
}

BottomTabAvatar.propTypes = propTypes;
BottomTabAvatar.defaultProps = defaultProps;
BottomTabAvatar.displayName = 'BottomTabAvatar';
export default BottomTabAvatar;
