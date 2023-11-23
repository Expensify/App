import React from 'react';
import CONST from '@src/CONST';
import useThemeStyles from '@styles/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import variables from '@styles/variables';
import * as Expensicons from './Icon/Expensicons';
import Tooltip from './Tooltip';
import { PressableWithoutFeedback } from './Pressable';
import Icon from './Icon';
import Text from './Text';

type SearchProps = {
    // Callback fired when component is pressed
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;

    // Text explaining what the user can search for
    text: string;

    // Styles to apply on the outer element
    style?: StyleProp<ViewStyle>;
};

function Search({ onPress, text, style }: SearchProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Tooltip text={translate('common.search')}>
            <PressableWithoutFeedback
                accessibilityLabel={translate('sidebarScreen.buttonSearchLabel')}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                style={[styles.flex1, styles.flexRow, styles.gap2, styles.ph7, styles.alignItemsCenter, styles.searchPressableContainer, style]}
                onPress={onPress}
            >
                <Icon src={Expensicons.MagnifyingGlass} width={variables.iconSizeSmall} height={variables.iconSizeSmall} />
                <Text
                    style={styles.searchInputStyle}
                    numberOfLines={1}
                >
                    {text}
                </Text>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

Search.displayName = 'Badge';

export default Search;
