import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {SortOrder} from './types';

type SearchTableHeaderColumnProps = WithSentryLabel & {
    text: string;
    icon?: IconAsset;
    isActive: boolean;
    sortOrder: SortOrder;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the inner content row. Put padding/borders here, not on the container, so flex columns stay aligned. */
    innerContainerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: SortOrder) => void;
};

type SortableHeaderLabelProps = Pick<SearchTableHeaderColumnProps, 'text' | 'icon' | 'isActive' | 'sortOrder' | 'innerContainerStyle' | 'textStyle'>;

/** A heading's icon and text, with the sort direction when the table is sorted by its column. */
function SortableHeaderLabel({text, icon, isActive, sortOrder, innerContainerStyle, textStyle}: SortableHeaderLabelProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowDownLong', 'ArrowUpLong']);
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, innerContainerStyle]}>
            {!!icon && (
                <Icon
                    src={icon}
                    fill={theme.icon}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                />
            )}
            {!!text && (
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroSupporting, isActive && styles.searchTableHeaderActive, textStyle]}
                >
                    {text}
                </Text>
            )}
            {isActive && (
                <Icon
                    src={sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? icons.ArrowUpLong : icons.ArrowDownLong}
                    fill={theme.icon}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
            )}
        </View>
    );
}

export default function SortableHeaderText({
    text,
    icon,
    sortOrder,
    isActive,
    textStyle,
    containerStyle,
    innerContainerStyle,
    isSortable = true,
    onPress,
    sentryLabel,
}: SearchTableHeaderColumnProps) {
    if (!isSortable) {
        return (
            <View style={containerStyle}>
                <SortableHeaderLabel
                    text={text}
                    icon={icon}
                    isActive={false}
                    sortOrder={sortOrder}
                    innerContainerStyle={innerContainerStyle}
                    textStyle={textStyle}
                />
            </View>
        );
    }

    const nextSortOrder = isActive && sortOrder === CONST.SEARCH.SORT_ORDER.DESC ? CONST.SEARCH.SORT_ORDER.ASC : CONST.SEARCH.SORT_ORDER.DESC;

    return (
        <View style={containerStyle}>
            <PressableWithFeedback
                onPress={() => onPress(nextSortOrder)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                accessible
                sentryLabel={sentryLabel}
            >
                <SortableHeaderLabel
                    text={text}
                    icon={icon}
                    isActive={isActive}
                    sortOrder={sortOrder}
                    innerContainerStyle={innerContainerStyle}
                    textStyle={textStyle}
                />
            </PressableWithFeedback>
        </View>
    );
}

export {SortableHeaderLabel};
