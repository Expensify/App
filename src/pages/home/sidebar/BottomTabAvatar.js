/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
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

    const showSettingsPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS);
    }, [isCreateMenuOpen]);

    if (emojiStatus) {
        return (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isCreateMenuOpen={isCreateMenuOpen}
                isSelected={isSelected}
                onPress={showSettingsPage}
            />
        );
    }
    return (
        <PressableAvatarWithIndicator
            isCreateMenuOpen={isCreateMenuOpen}
            isSelected={isSelected}
            onPress={showSettingsPage}
        />
    );
}

BottomTabAvatar.propTypes = propTypes;
BottomTabAvatar.defaultProps = defaultProps;
BottomTabAvatar.displayName = 'BottomTabAvatar';
export default BottomTabAvatar;
