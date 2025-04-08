import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpExpandableProps = {
    children: React.ReactNode;
    styles: ThemeStyles;
    containerStyle?: StyleProp<ViewStyle>;
    title?: string;
    moreText?: string;
};

function HelpExpandable({children, styles, containerStyle, title, moreText = '(more)'}: HelpExpandableProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={containerStyle}>
            <Text style={styles.textNormal}>
                {!!title && `${title} `}
                {!isExpanded && (
                    <Text
                        style={styles.link}
                        onPress={() => setIsExpanded(true)}
                    >
                        {moreText}
                    </Text>
                )}
            </Text>
            {isExpanded && children}
        </View>
    );
}

HelpExpandable.displayName = 'ExpandableHelp';

export default HelpExpandable;
