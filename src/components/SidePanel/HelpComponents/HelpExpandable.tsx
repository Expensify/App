import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpExpandableProps = {
    /** The content to be displayed when expanded. */
    children: React.ReactNode;

    /** Whether the component is expanded or not. */
    isExpanded: boolean;

    /** Function to toggle the expanded state. */
    setIsExpanded: () => void;

    /** Optional additional styles for the container. */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles object containing theme styles. */
    styles: ThemeStyles;
};

function HelpExpandable({children, styles, containerStyle, isExpanded, setIsExpanded}: HelpExpandableProps) {
    return (
        <View style={containerStyle}>
            {isExpanded ? (
                children
            ) : (
                <Text
                    style={styles.link}
                    onPress={setIsExpanded}
                >
                    Show more
                </Text>
            )}
        </View>
    );
}

export default HelpExpandable;
