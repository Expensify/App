import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {ButtonComponentProps, FilterPopupButtonProps} from './FilterPopupButton';
import FilterPopupButton from './FilterPopupButton';

type DropdownButtonComponentProps = ButtonComponentProps;

type DropdownButtonProps = WithSentryLabel &
    Omit<FilterPopupButtonProps, 'renderButton' | 'viewportOffsetTop' | 'popoverAnchorAlignment'> & {
        /** The label to display on the select */
        label: string;

        /** The selected value(s) if any */
        value: string | string[] | null;

        /** The component to render as the button */
        ButtonComponent?: React.ComponentType<DropdownButtonComponentProps>;

        /** Whether to use medium size button instead of small */
        medium?: boolean;

        /** Button inner styles */
        innerStyles?: StyleProp<ViewStyle>;

        /** Button label style */
        labelStyle?: StyleProp<TextStyle>;

        /** Caret wrapper style */
        caretWrapperStyle?: StyleProp<ViewStyle>;

        /** Popover anchor alignment relative to the trigger */
        anchorAlignment?: FilterPopupButtonProps['popoverAnchorAlignment'];

        onClosePress?: () => void;
    };

function DropdownButton({
    label,
    value,
    ButtonComponent,
    medium = false,
    labelStyle,
    innerStyles,
    caretWrapperStyle,
    sentryLabel,
    anchorAlignment,
    onClosePress,
    ...props
}: DropdownButtonProps) {
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
            popoverAnchorAlignment={anchorAlignment}
            renderButton={(buttonProps) => {
                if (ButtonComponent) {
                    return <ButtonComponent {...buttonProps} />;
                }

                return (
                    <View style={[styles.flexRow]}>
                        <Button
                            ref={buttonProps.ref}
                            innerStyles={[buttonProps.isExpanded && styles.buttonHoveredBG, {maxWidth: 256}, innerStyles, shouldShowCloseButton && styles.pr2]}
                            onPress={buttonProps.onPress}
                            sentryLabel={sentryLabel}
                            shouldRemoveRightBorderRadius={shouldShowCloseButton}
                            {...(medium ? {medium: true} : {small: true})}
                        >
                            <CaretWrapper
                                style={[styles.flex1, styles.mw100, caretWrapperStyle]}
                                caretWidth={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                                caretHeight={medium ? variables.iconSizeSmall : variables.iconSizeExtraSmall}
                                isActive={buttonProps.isExpanded}
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
                );
            }}
        />
    );
}

export default DropdownButton;
export type {DropdownButtonComponentProps, DropdownButtonProps};
