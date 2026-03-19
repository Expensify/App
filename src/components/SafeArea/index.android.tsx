import React from 'react';
import {Keyboard} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import type SafeAreaProps from './types';

function SafeArea({children}: SafeAreaProps) {
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {left, right} = useSafeAreaInsets();

    console.log('SafeAreaAndroid2');

    if (!isInLandscapeMode) {
        return children;
    }

    return (
        <SafeAreaView
            style={[styles.iPhoneXSafeArea]}
            edges={['left', 'right']}
        >
            {children}
            {left > 0 && (
                <PressableWithoutFeedback
                    style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: left}}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessibilityLabel=""
                />
            )}
            {right > 0 && (
                <PressableWithoutFeedback
                    style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: right}}
                    onPress={() => Keyboard.dismiss()}
                    role="none"
                    accessibilityLabel=""
                />
            )}
        </SafeAreaView>
    );
}

export default SafeArea;
