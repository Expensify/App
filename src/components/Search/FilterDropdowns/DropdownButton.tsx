import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

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

        /** When true, the close button is shown but disabled (used for a suggested search's mandatory filters) */
        isCloseButtonDisabled?: boolean;
    };

function DropdownButton({label, value, medium = false, labelStyle, innerStyles, caretWrapperStyle, sentryLabel, onClosePress, isCloseButtonDisabled = false, ...props}: DropdownButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    // A suggested search's mandatory filters can't be removed, so we omit the close section entirely and
    // render a fully-rounded pill rather than a disabled "x".
    const shouldShowCloseButton = !!onClosePress && !isCloseButtonDisabled;

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
                        innerStyles={[isExpanded && styles.buttonHoveredBG, {maxWidth: 256}, styles.mw100, styles.flexShrink1, innerStyles, shouldShowCloseButton && styles.pr2]}
                        onPress={onPress}
                        sentryLabel={sentryLabel}
                        shouldRemoveRightBorderRadius={shouldShowCloseButton}
                        {...(medium ? {medium: true} : {small: true})}
                    >
                        <CaretWrapper
                            style={[styles.flex1, styles.mw100, caretWrapperStyle]}
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
                                small
                                shouldRemoveLeftBorderRadius
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
