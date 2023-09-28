/* eslint-disable rulesdir/onyx-props-must-have-default */
import React, {useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import Text from '../../../components/Text';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';
import Navigation from '../../../libs/Navigation/Navigation';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const propTypes = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: PropTypes.bool,

    /** Emoji status */
    emojiStatus: PropTypes.string,
};

const defaultProps = {
    isCreateMenuOpen: false,
    emojiStatus: '',
};

function AvatarWithOptionalStatus({emojiStatus, isCreateMenuOpen}) {
    const {translate} = useLocalize();

    const showStatusPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.setShouldPopAllStateOnUP();
        Navigation.navigate(ROUTES.SETTINGS_STATUS);
    }, [isCreateMenuOpen]);

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

AvatarWithOptionalStatus.propTypes = propTypes;
AvatarWithOptionalStatus.defaultProps = defaultProps;
AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
export default AvatarWithOptionalStatus;
