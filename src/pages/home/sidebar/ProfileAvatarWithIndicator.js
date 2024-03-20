/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as UserUtils from '@libs/UserUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Indicates whether the app is loading initial data */
    isLoading: PropTypes.bool,

    /** Whether the avatar is selected */
    isSelected: PropTypes.bool,
};

const defaultProps = {
    currentUserPersonalDetails: {
        pendingFields: {avatar: ''},
        accountID: '',
        avatar: '',
    },
    isLoading: true,
    isSelected: false,
};

function ProfileAvatarWithIndicator({currentUserPersonalDetails, isLoading, isSelected}) {
    const styles = useThemeStyles();

    return (
        <OfflineWithFeedback pendingAction={lodashGet(currentUserPersonalDetails, 'pendingFields.avatar', null)}>
            <View style={[isSelected && styles.selectedAvatarBorder]}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={isLoading && !currentUserPersonalDetails.avatar}
                />
            </View>
        </OfflineWithFeedback>
    );
}

ProfileAvatarWithIndicator.propTypes = propTypes;
ProfileAvatarWithIndicator.defaultProps = defaultProps;
ProfileAvatarWithIndicator.displayName = 'ProfileAvatarWithIndicator';
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoading: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    }),
)(ProfileAvatarWithIndicator);
