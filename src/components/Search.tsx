import React from 'react';
import {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
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
    prompt: string;

    // Text showing up in a tooltip when component is hovered
    tooltip?: string;

    // Styles to apply on the outer element
    style?: StyleProp<ViewStyle>;
};

function Search({onPress, prompt, tooltip, style}: SearchProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Tooltip text={tooltip ?? translate('common.search')}>
            <PressableWithFeedback
                accessibilityLabel={translate('sidebarScreen.buttonSearchLabel')}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                onPress={onPress}
            >
                {({hovered}) => (
                    <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.ph6, styles.alignItemsCenter, styles.searchContainer, hovered && styles.searchContainerHovered, style]}>
                        <Icon
                            src={Expensicons.MagnifyingGlass}
                            width={ variables.iconSizeSmall }
                            height={variables.iconSizeSmall}
                        />
                        <Text
                            style={styles.searchInputStyle}
                            numberOfLines={1}
                        >
                            {prompt}
                        </Text>
                    </View>
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

Search.displayName = 'Search';

export default Search;
