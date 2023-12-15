/* eslint-disable rulesdir/onyx-props-must-have-default */
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';

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
    const styles = useThemeStyles();
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
                role={CONST.ROLE.BUTTON}
                onPress={showStatusPage}
                style={styles.flex1}
            >
                <Tooltip text={translate('statusPage.status')}>
                    <View style={styles.sidebarStatusAvatar}>
                        <Text
                            style={styles.emojiStatusLHN}
                            numberOfLines={1}
                        >
                            {emojiStatus}
                        </Text>
                    </View>
                </Tooltip>
            </PressableWithoutFeedback>
            <PressableAvatarWithIndicator isCreateMenuOpen={isCreateMenuOpen} />
        </View>
    );
}

AvatarWithOptionalStatus.propTypes = propTypes;
AvatarWithOptionalStatus.defaultProps = defaultProps;
AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
export default AvatarWithOptionalStatus;
