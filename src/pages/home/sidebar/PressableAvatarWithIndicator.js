/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import Navigation from '../../../libs/Navigation/Navigation';
import * as UserUtils from '../../../libs/UserUtils';
import useLocalize from '../../../hooks/useLocalize';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import personalDetailsPropType from '../../personalDetailsPropType';

const propTypes = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,

    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,
};

const defaultProps = {
    isCreateMenuOpen: false,
    currentUserPersonalDetails: {
        pendingFields: {avatar: ''},
        accountID: '',
        avatar: '',
    },
};

function PressableAvatarWithIndicator({isCreateMenuOpen, currentUserPersonalDetails}) {
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
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            onPress={showSettingsPage}
        >
            <OfflineWithFeedback pendingAction={lodashGet(currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    tooltipText={translate('common.settings')}
                />
            </OfflineWithFeedback>
        </PressableWithoutFeedback>
    );
}

PressableAvatarWithIndicator.propTypes = propTypes;
PressableAvatarWithIndicator.defaultProps = defaultProps;
PressableAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';
export default withCurrentUserPersonalDetails(PressableAvatarWithIndicator);
