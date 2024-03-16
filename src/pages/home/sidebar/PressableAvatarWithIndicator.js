/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as UserUtils from '@libs/UserUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Indicates whether the app is loading initial data */
    isLoading: PropTypes.bool,

    /** Whether the avatar is selected */
    isSelected: PropTypes.bool,

    /** Callback called when the avatar is pressed */
    onPress: PropTypes.func,
};

const defaultProps = {
    currentUserPersonalDetails: {
        pendingFields: {avatar: ''},
        accountID: '',
        avatar: '',
    },
    isLoading: true,
    isSelected: false,
    onPress: () => {},
};

function PressableAvatarWithIndicator({currentUserPersonalDetails, isLoading, isSelected, onPress}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={onPress}
        >
            <OfflineWithFeedback pendingAction={lodashGet(currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                <View style={[isSelected && styles.selectedAvatarBorder]}>
                    <AvatarWithIndicator
                        source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                        tooltipText={translate('profilePage.profile')}
                        fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                        isLoading={isLoading && !currentUserPersonalDetails.avatar}
                    />
                </View>
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
