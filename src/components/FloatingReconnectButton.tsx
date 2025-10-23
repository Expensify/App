import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as App from '@userActions/App';
import * as Expensicons from './Icon/Expensicons';
import Icon from './Icon';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function FloatingReconnectButton() {
    const theme = useTheme();
    const styles = useThemeStyles();

    const handleReconnect = () => {
        App.reconnectApp();
    };

    return (
        <View style={[styles.floatingReconnectButton]}>
            <PressableWithFeedback
                onPress={handleReconnect}
                style={[styles.floatingReconnectButtonInner]}
                accessibilityLabel="Reconnect app"
                role="button"
            >
                <Icon
                    src={Expensicons.Sync}
                    fill={theme.textLight}
                    width={20}
                    height={20}
                />
                <Text style={[styles.floatingReconnectButtonText]}>
                    Reconnect
                </Text>
            </PressableWithFeedback>
        </View>
    );
}

FloatingReconnectButton.displayName = 'FloatingReconnectButton';

export default FloatingReconnectButton;