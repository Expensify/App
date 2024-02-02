import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';
import Tooltip from './Tooltip';

type SearchProps = {
    // Callback fired when component is pressed
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;

    // Text explaining what the user can search for
    placeholder?: string;

    // Text showing up in a tooltip when component is hovered
    tooltip?: string;

    // Styles to apply on the outer element
    style?: StyleProp<ViewStyle>;

    /** Styles to apply to the outermost element */
    containerStyle?: StyleProp<ViewStyle>;
};

function Search({onPress, placeholder, tooltip, style, containerStyle}: SearchProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View style={containerStyle}>
            <Tooltip text={tooltip ?? translate('common.search')}>
                <PressableWithFeedback
                    accessibilityLabel={tooltip ?? translate('common.search')}
                    role={CONST.ROLE.BUTTON}
                    onPress={onPress}
                    style={styles.searchPressable}
                >
                    {({hovered}) => (
                        <View style={[styles.searchContainer, hovered && styles.searchContainerHovered, style]}>
                            <Icon
                                src={Expensicons.MagnifyingGlass}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                                fill={theme.icon}
                            />
                            <Text
                                style={styles.searchInputStyle}
                                numberOfLines={1}
                            >
                                {placeholder ?? translate('common.searchWithThreeDots')}
                            </Text>
                        </View>
                    )}
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
