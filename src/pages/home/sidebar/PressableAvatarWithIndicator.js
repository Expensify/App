/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,

    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Indicates whether the app is loading initial data */
    isLoading: PropTypes.bool,
};

const defaultProps = {
    isCreateMenuOpen: false,
    currentUserPersonalDetails: {
        pendingFields: {avatar: ''},
        accountID: '',
        avatar: '',
    },
    isLoading: true,
};

function PressableAvatarWithIndicator({isCreateMenuOpen, currentUserPersonalDetails, isLoading}) {
    const {translate} = useLocalize();

    const showSettingsPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS);
    }, [isCreateMenuOpen]);

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            onPress={showSettingsPage}
        >
            <OfflineWithFeedback pendingAction={lodashGet(currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    tooltipText={translate('common.settings')}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={isLoading && !currentUserPersonalDetails.avatar}
                />
            </OfflineWithFeedback>
        </PressableWithoutFeedback>
    );
}

PressableAvatarWithIndicator.propTypes = propTypes;
PressableAvatarWithIndicator.defaultProps = defaultProps;
PressableAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoading: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    }),
)(PressableAvatarWithIndicator);
