import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import {FILTER_VIEW_MAP, getFilterViewLabelKey} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type ItemCallback = (filter: SearchFilter['key']) => void;
type FilterItemCallbacks = {
    onHoverIn?: ItemCallback;
    onFocus?: ItemCallback;
    onPress?: ItemCallback;
};

type FilterListProps = FilterItemCallbacks & {
    type: SearchDataTypes | undefined;
    selectedFilter?: SearchFilter['key'];
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Whether to show a search input above the list that narrows the filters by their label. */
    shouldShowSearchInput?: boolean;

    /** Called as the cursor travels over the list. Web only - it reports the movement inside a row, which `onHoverIn` only reports entering. */
    onPointerMove?: (event: {clientX: number; clientY: number}) => void;

    /** Called when the cursor leaves the list, so the consumer can settle whatever it was still waiting on for the last row. Web only. */
    onPointerLeave?: (event: {clientX: number}) => void;
};

type FilterItemProps = FilterItemCallbacks & {
    filterKey: SearchFilter['key'];
    isSelected?: boolean;
    type: SearchDataTypes | undefined;
};

function FilterItem({filterKey, isSelected, type, onPress, onHoverIn, onFocus}: FilterItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const {icon} = FILTER_VIEW_MAP[filterKey];
    const labelKey = getFilterViewLabelKey(filterKey, type);
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
                    <Text
                        numberOfLines={2}
                        style={[styles.flex1]}
                    >
                        {translate(labelKey)}
                    </Text>
                    <Icon
                        src={icons.ArrowRight}
                        fill={StyleUtils.getIconFillColor({
                            buttonState: getButtonState({
                                isActive: isSelected,
                                isPressed: pressed,
                            }),
                        })}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </PressableWithFeedback>
    );
}

function FilterList({type, selectedFilter, style, contentContainerStyle, shouldShowSearchInput, onHoverIn, onFocus, onPress, onPointerMove, onPointerLeave}: FilterListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const typeFiltersKeys = useAdvancedSearchFilters(type);
    const [searchValue, setSearchValue] = useState('');

    const normalizedSearchValue = searchValue.trim().toLowerCase();
    const filteredSections = normalizedSearchValue
        ? typeFiltersKeys
              .map((section) => section.filter((item) => translate(getFilterViewLabelKey(item, type)).toLowerCase().includes(normalizedSearchValue)))
              .filter((section) => section.length > 0)
        : typeFiltersKeys;

    const list = (
        <ScrollView
            style={shouldShowSearchInput ? [styles.flex1] : [style]}
            contentContainerStyle={[contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            onMouseMove={onPointerMove}
            onMouseLeave={onPointerLeave}
        >
            {filteredSections.length === 0 && <Text style={[styles.textLabel, styles.colorMuted, styles.ph5, styles.pv3]}>{translate('common.noResultsFound')}</Text>}
            {filteredSections.map((section, index) => (
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
                            type={type}
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

    if (!shouldShowSearchInput) {
        return list;
    }

    return (
        <View style={[style]}>
            <View style={[styles.ph5, styles.pt2, styles.pb2]}>
                <TextInput
                    accessibilityLabel={translate('common.search')}
                    role={CONST.ROLE.PRESENTATION}
                    value={searchValue}
                    placeholder={translate('common.search')}
                    placeholderTextColor={theme.textSupporting}
                    onChangeText={setSearchValue}
                    spellCheck={false}
                    shouldHideClearButton={false}
                    clearButtonStyle={styles.mr0}
                    clearButtonIconSize={variables.iconSizeSmall}
                    touchableInputWrapperStyle={isSmallScreenWidth ? styles.listSearchInputNarrowWrapper : styles.listSearchInputWideWrapper}
                    textInputContainerStyles={[styles.pb0, isSmallScreenWidth ? styles.ph3 : styles.ph2]}
                    inputStyle={[styles.w100, styles.lineHeightUndefined, isSmallScreenWidth ? undefined : styles.fontSizeLabel]}
                />
            </View>
            {list}
        </View>
    );
}

export default FilterList;
