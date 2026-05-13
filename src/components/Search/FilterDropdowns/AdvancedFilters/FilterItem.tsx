import React, {useState} from 'react';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();

    const [isPressed, setIsPressed] = useState(false);

    const {labelKey, icon} = FILTER_VIEW_MAP[filterKey];
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', icon]);

    const getPressableBackgroundStyle = () => {
        if (isPressed) {
            return styles.buttonHoveredBG;
        }

        if (isSelected) {
            return styles.hoveredComponentBG;
        }

        return undefined;
    };

    return (
        <PressableWithFeedback
            style={[styles.typeFilterMenu, getPressableBackgroundStyle()]}
            accessible
            accessibilityLabel={filterKey}
            onHoverIn={onHoverIn}
            onFocus={onFocus}
            onPress={() => {
                onPress?.();
                setIsPressed(false);
            }}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            sentryLabel={`Search-Advanced-Filter-${filterKey}`}
        >
            <Icon
                src={icons[icon]}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text style={[styles.flex1]}>{translate(labelKey)}</Text>
            <Icon
                src={icons.ArrowRight}
                fill={StyleUtils.getIconFillColor(getButtonState(isSelected, isPressed))}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </PressableWithFeedback>
    );
}

export default FilterItem;
