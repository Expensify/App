import React from 'react';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import variables from '@styles/variables';

type FilterItemProps = {
    filterKey: SearchFilter['key'];
    isSelected?: boolean;
    onPress?: () => void;
    onHoverIn?: () => void;
    onFocus?: () => void;
};

function FilterItem({filterKey, isSelected, onPress, onHoverIn, onFocus}: FilterItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {labelKey, icon} = FILTER_VIEW_MAP[filterKey];
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', icon]);

    return (
        <PressableWithFeedback
            style={({pressed}) => [styles.typeFilterMenu, StyleUtils.getButtonBackgroundColorStyle(getButtonState(isSelected, pressed), true)]}
            accessible
            accessibilityLabel={filterKey}
            onHoverIn={onHoverIn}
            onFocus={onFocus}
            onPress={onPress}
            sentryLabel={`Search-Advanced-Filter-${filterKey}`}
        >
            {({pressed}) => (
                <>
                    <Icon
                        src={icons[icon]}
                        fill={StyleUtils.getIconFillColor(getButtonState(isSelected, pressed))}
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

export default FilterItem;
