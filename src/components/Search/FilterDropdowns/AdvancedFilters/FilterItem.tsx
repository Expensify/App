import React, {useRef} from 'react';
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

    const shouldCallPressOnPressOutRef = useRef(false);
    const shouldCallPressOnPressRef = useRef(false);

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
            onHoverIn={onHoverIn}
            onFocus={onFocus}
            onPress={() => {
                // Pressable has an issue (https://github.com/facebook/react-native/issues/29714) where onPress
                // could be triggered earlier before onPressOut when the press happens quickly.
                // Normal interaction: onPressIn -> onPressOut -> onPress
                // Buggy interaction: onPressIn -> onPress -> onPressOut
                // onPress is called immediately if we are going through the normal interaction (onPress is triggered after onPressOut).
                // Otherwise, the onPress will be triggered later in onPressOut.
                if (shouldCallPressOnPressRef.current) {
                    onPress?.();
                    shouldCallPressOnPressRef.current = false;
                    return;
                }

                shouldCallPressOnPressOutRef.current = true;
            }}
            onPressOut={() => {
                if (!shouldCallPressOnPressOutRef.current) {
                    shouldCallPressOnPressRef.current = true;
                    return;
                }
                // If shouldCallPressOnPressOutRef.current is true, then it means onPress is triggered earlier before onPressOut
                // and we only want to trigger the onPress after onPressOut, because when this component is hidden by Activity,
                // onPressOut won't be triggered anymore. This fix make sure onPressOut will always be triggered.
                // We could probably fix this in GenericPressable, but since the bug only affect this component, I'll keep the fix scope small.
                onPress?.();
                shouldCallPressOnPressOutRef.current = false;
            }}
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

export default FilterItem;
