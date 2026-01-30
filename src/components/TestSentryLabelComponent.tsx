import React from 'react';
import {View} from 'react-native';
import {PressableWithDelayToggle, PressableWithFeedback, PressableWithoutFeedback} from './Pressable';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';

function TestSentryLabelComponent() {
    return (
        <View>
            <PressableWithFeedback
                onPress={() => {}}
                accessibilityLabel=""
            >
                <View />
            </PressableWithFeedback>
            <PressableWithoutFeedback
                onPress={() => {}}
                accessibilityLabel=""
            >
                <View />
            </PressableWithoutFeedback>
            <PressableWithoutFocus
                onPress={() => {}}
                accessibilityLabel=""
            >
                <View />
            </PressableWithoutFocus>
            <PressableWithDelayToggle
                text=""
                textChecked=""
                inline={false}
                onPress={() => {}}
                accessible={false}
                tooltipText=""
                tooltipTextChecked=""
            />
        </View>
    );
}

export default TestSentryLabelComponent;
