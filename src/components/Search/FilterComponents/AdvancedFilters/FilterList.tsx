import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import type {PolicyIDFilter} from '@libs/SearchQueryUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type ItemCallback = (filter: SearchFilter['key']) => void;
type FilterItemCallbacks = {
    onHoverIn?: ItemCallback;
    onFocus?: ItemCallback;
    onPress?: ItemCallback;
};

type FilterListProps = FilterItemCallbacks & {
    type: SearchDataTypes | undefined;
    policyID: PolicyIDFilter;
    selectedFilter?: SearchFilter['key'];
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
};

type FilterItemProps = FilterItemCallbacks & {
    filterKey: SearchFilter['key'];
    isSelected?: boolean;
};

function FilterItem({filterKey, isSelected, onPress, onHoverIn, onFocus}: FilterItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const {labelKey, icon} = FILTER_VIEW_MAP[filterKey];
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', icon]);

    const getPressableBackgroundStyle = (pressed: boolean) => {
        if (pressed) {
            return styles.buttonHoveredBG;
        }

        if (isSelected) {
            return styles.hoveredComponentBG;
        }

        return undefined;
    };

    return (
        <PressableWithFeedback
            style={({pressed}) => [styles.typeFilterMenu, getPressableBackgroundStyle(pressed)]}
            accessible
            accessibilityLabel={filterKey}
            onHoverIn={() => onHoverIn?.(filterKey)}
            onFocus={() => onFocus?.(filterKey)}
            onPress={() => onPress?.(filterKey)}
            sentryLabel={`Search-Advanced-Filter-${filterKey}`}
        >
            {({pressed}) => (
                <>
                    <Icon
                        src={icons[icon]}
                        fill={theme.icon}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                    />
                    <Text style={[styles.flex1]}>{translate(labelKey)}</Text>
                    <Icon
                        src={icons.ArrowRight}
                        fill={StyleUtils.getIconFillColor(getButtonState(isSelected, pressed))}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </PressableWithFeedback>
    );
}

function FilterList({type, policyID, selectedFilter, style, contentContainerStyle, onHoverIn, onFocus, onPress}: FilterListProps) {
    const styles = useThemeStyles();
    const typeFiltersKeys = useAdvancedSearchFilters(type, policyID);

    return (
        <ScrollView
            style={[style]}
            contentContainerStyle={[contentContainerStyle]}
            showsVerticalScrollIndicator={false}
        >
            {typeFiltersKeys.map((section, index) => (
                <View key={`${section.at(0)}`}>
                    {index !== 0 && (
                        <SpacerView
                            shouldShow
                            style={[styles.reportHorizontalRule]}
                        />
                    )}
                    {section.map((item) => (
                        <FilterItem
                            key={item}
                            filterKey={item}
                            isSelected={item === selectedFilter}
                            onHoverIn={onHoverIn}
                            onFocus={onFocus}
                            onPress={onPress}
                        />
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

export default FilterList;
