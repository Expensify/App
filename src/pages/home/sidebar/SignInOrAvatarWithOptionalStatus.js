/* eslint-disable rulesdir/onyx-props-must-have-default */
import React, {useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import personalDetailsPropType from '../../personalDetailsPropType';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as Session from '../../../libs/actions/Session';
import Permissions from '../../../libs/Permissions';
import compose from '../../../libs/compose';
import useLocalize from '../../../hooks/useLocalize';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const propTypes = {
    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: personalDetailsPropType,

    isCreateMenuOpen: PropTypes.bool,

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
    const {translate} = useLocalize();
    const statusEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const emojiStatus = Permissions.canUseCustomStatus(betas) ? statusEmojiCode : '';

    const showStatusPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.setShouldPopAllStateOnUP();
        Navigation.navigate(ROUTES.SETTINGS_STATUS);
    }, [isCreateMenuOpen]);

    if (Session.isAnonymousUser()) {
        return (
            <PressableWithoutFeedback
                accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                onPress={Session.signOutAndRedirectToSignIn}
            >
                <View style={styles.signInButtonAvatar}>
                    <Button
                        medium
                        success
                        text={translate('common.signIn')}
                        onPress={Session.signOutAndRedirectToSignIn}
                    />
                </View>
            </PressableWithoutFeedback>
        );
    }
    if (emojiStatus) {
        return (
            <View style={styles.sidebarStatusAvatarContainer}>
                <PressableWithoutFeedback
                    accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    onPress={showStatusPage}
                    style={styles.flex1}
                >
                    <View style={styles.sidebarStatusAvatar}>
                        <Text
                            style={styles.emojiStatusLHN}
                            numberOfLines={1}
                        >
                            {emojiStatus}
                        </Text>
                    </View>
                </PressableWithoutFeedback>
                <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />
            </View>
        );
    }
    return <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />;
}

SignInOrAvatarWithOptionalStatus.propTypes = propTypes;
SignInOrAvatarWithOptionalStatus.defaultProps = defaultProps;
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SignInOrAvatarWithOptionalStatus);
