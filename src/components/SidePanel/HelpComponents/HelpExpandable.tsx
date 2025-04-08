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
    styles: ThemeStyles;

    /** Title text to be displayed before the expandable content. */
    title?: string;
};

function HelpExpandable({children, styles, containerStyle, title, isExpanded, setIsExpanded}: HelpExpandableProps) {
    return (
        <View style={containerStyle}>
            <Text style={styles.textNormal}>
                {!!title && `${title} `}
                {!isExpanded && (
                    <Text
                        style={styles.link}
                        onPress={setIsExpanded}
                    >
                        Show more
                    </Text>
                )}
            </Text>
            {isExpanded && children}
        </View>
    );
}

HelpExpandable.displayName = 'ExpandableHelp';

export default HelpExpandable;
