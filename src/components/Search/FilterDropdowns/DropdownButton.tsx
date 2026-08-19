import Button from '@components/ButtonComposed';
import CaretWrapper from '@components/CaretWrapper';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {FilterPopupButtonProps} from './FilterPopupButton';

import FilterPopupButton from './FilterPopupButton';

type DropdownButtonProps = WithSentryLabel &
    Omit<FilterPopupButtonProps, 'renderButton' | 'viewportOffsetTop'> & {
        /** The label to display on the select */
        label: string;

        /** The selected value(s) if any */
        value: string | string[] | null;

        /** Whether to use medium size button instead of small */
        medium?: boolean;

        /** Button inner styles */
        innerStyles?: StyleProp<ViewStyle>;

        /** Button label style */
        labelStyle?: StyleProp<TextStyle>;

        /** Caret wrapper style */
        caretWrapperStyle?: StyleProp<ViewStyle>;
        onClosePress?: () => void;
    };

function DropdownButton({label, value, medium = false, labelStyle, innerStyles, caretWrapperStyle, sentryLabel, onClosePress, ...props}: DropdownButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    const shouldShowCloseButton = !!onClosePress;

    /**
     * When no items are selected, render the label, otherwise, render the
     * list of selected items as well
     */
    const getButtonText = () => {
        if (!value?.length) {
            return label;
        }

        const selectedItems = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${selectedItems}`;
    };

    return (
        <FilterPopupButton
            {...props}
            renderButton={({onPress, ref, isExpanded}) => (
                <View style={[styles.flexRow, styles.mw100, styles.flexShrink1]}>
                    <Button
                        ref={ref}
                        style={styles.flexShrink1}
                        innerStyles={[
                            // Restores the size padding: there is no `Button.Text` child here to contribute its `ph1`.
                            medium ? styles.ph4 : styles.ph3,
                            isExpanded && styles.buttonHoveredBG,
                            {maxWidth: variables.filterPillMaxWidth},
                            styles.flexShrink1,
                            innerStyles,
                            shouldShowCloseButton && styles.pr2,
                        ]}
                        onPress={onPress}
                        sentryLabel={sentryLabel}
                        removeBorderRadius={shouldShowCloseButton ? CONST.BUTTON_REMOVE_BORDER_RADIUS.RIGHT : undefined}
                        size={medium ? CONST.BUTTON_SIZE.MEDIUM : CONST.BUTTON_SIZE.SMALL}
                    >
                        <CaretWrapper
                            // Replaces flex1 with flexShrink1 so a long label truncates instead of widening the pill.
                            style={[styles.flexShrink1, styles.mw100, caretWrapperStyle]}
                            caretWidth={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                            caretHeight={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                            isActive={isExpanded}
                        >
                            <Text
                                numberOfLines={1}
                                style={[styles.textMicroBold, styles.flexShrink1, labelStyle]}
                            >
                                {getButtonText()}
                            </Text>
                        </CaretWrapper>
                    </Button>
                    {shouldShowCloseButton && (
                        <>
                            <View style={[styles.buttonDivider]} />
                            <Button
                                size={CONST.BUTTON_SIZE.SMALL}
                                removeBorderRadius={CONST.BUTTON_REMOVE_BORDER_RADIUS.LEFT}
                                innerStyles={[styles.pl0, styles.pr0half, styles.filterDropDownCloseIcon]}
                                onPress={onClosePress}
                            >
                                <Icon
                                    src={icons.Close}
                                    fill={theme.icon}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                />
                            </Button>
                        </>
                    )}
                </View>
            )}
        />
    );
}

export default DropdownButton;
export type {DropdownButtonProps};
