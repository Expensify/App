import lodashDefer from 'lodash/defer';
import type {ReactElement, ReactNode, RefObject} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {View} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useScrollContext from '@hooks/useScrollContext';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import type {BasePickerProps} from './types';

type IconToRender = () => ReactElement;

function BasePicker<TPickerValue>({
    items,
    backgroundColor,
    inputID,
    value,
    onInputChange,
    icon,
    label = '',
    isDisabled = false,
    errorText = '',
    hintText = '',
    containerStyles,
    placeholder = {},
    size = 'normal',
    shouldAllowDisabledStyle = true,
    shouldFocusPicker = false,
    shouldShowOnlyTextWhenDisabled = true,
    onBlur = () => {},
    additionalPickerEvents = () => {},
    ref,
}: BasePickerProps<TPickerValue>) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isHighlighted, setIsHighlighted] = useState(false);

    // reference to the root View
    const root = useRef<View>(null);

    // reference to @react-native-picker/picker
    const picker = useRef<RNPickerSelect>(null);

    useEffect(() => {
        if (!!value || !items || items.length !== 1 || !onInputChange) {
            return;
        }

        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        const item = items.at(0);
        if (item) {
            onInputChange(item.value, 0);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const context = useScrollContext();

    /**
     * Forms use inputID to set values. But BasePicker passes an index as the second parameter to onValueChange
     * We are overriding this behavior to make BasePicker work with Form
     */
    const onValueChange = (inputValue: TPickerValue, index: number) => {
        if (inputID) {
            onInputChange?.(inputValue);
            return;
        }

        onInputChange?.(inputValue, index);
    };

    const enableHighlight = () => {
        setIsHighlighted(true);
    };

    const disableHighlight = () => {
        setIsHighlighted(false);
    };

    const iconToRender = useMemo((): IconToRender => {
        if (icon) {
            return () => icon(size);
        }

        // eslint-disable-next-line react/display-name
        return () => (
            <Icon
                fill={theme.icon}
                src={icons.DownArrow}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(size === 'small' ? {width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height} : {})}
            />
        );
    }, [icon, size, styles, theme.icon, icons.DownArrow]);

    useImperativeHandle(ref, () => ({
        /**
         * Focuses the picker (if configured to do so)
         *
         * This method is used by Form
         */
        focus() {
            if (!shouldFocusPicker) {
                return;
            }

            // Defer the focusing to work around a bug on Mobile Safari, where focusing the `select` element in the
            // same task when we scrolled to it left that element in a glitched state, where the dropdown list can't
            // be opened until the element gets re-focused
            lodashDefer(() => {
                picker.current?.focus();
            });
        },

        /**
         * Like measure(), but measures the view relative to an ancestor
         *
         * This method is used by Form when scrolling to the input
         *
         * @param relativeToNativeComponentRef - reference to an ancestor
         * @param onSuccess - callback called on success
         * @param onFail - callback called on failure
         */
        measureLayout(relativeToNativeComponentRef, onSuccess, onFail) {
            if (!root.current) {
                return;
            }

            root.current.measureLayout(relativeToNativeComponentRef, onSuccess, onFail);
        },
    }));

    /**
     * We pass light text on Android, since Android Native alerts have a dark background in all themes for now.
     */
    const itemColor = useMemo(() => {
        if (getOperatingSystem() === CONST.OS.ANDROID) {
            return theme.textLight;
        }

        return theme.text;
    }, [theme]);

    // Windows will reuse the text color of the select for each one of the options
    // so we might need to color accordingly so it doesn't blend with the background.
    const pickerPlaceholder = Object.keys(placeholder).length > 0 ? {...placeholder, color: itemColor} : {};

    const hasError = !!errorText;

    if (isDisabled && shouldShowOnlyTextWhenDisabled) {
        return (
            <View>
                {!!label && (
                    <Text
                        style={[styles.textLabelSupporting, styles.mb1]}
                        numberOfLines={1}
                    >
                        {label}
                    </Text>
                )}
                <Text numberOfLines={1}>{value as ReactNode}</Text>
                {!!hintText && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{hintText}</Text>}
            </View>
        );
    }

    return (
        <>
            <View
                ref={root}
                style={[
                    styles.pickerContainer,
                    isDisabled && shouldAllowDisabledStyle && styles.inputDisabled,
                    containerStyles,
                    isHighlighted && styles.borderColorFocus,
                    hasError && styles.borderColorDanger,
                ]}
            >
                {!!label && <Text style={[styles.pickerLabel, styles.textLabelSupporting, styles.pointerEventsNone]}>{label}</Text>}
                <RNPickerSelect
                    onValueChange={onValueChange}
                    // We add a text color to prevent white text on white background dropdown items on Windows
                    items={items.map((item) => ({...item, color: itemColor}))}
                    style={size === 'normal' ? styles.picker(isDisabled, backgroundColor) : styles.pickerSmall(isDisabled, backgroundColor)}
                    useNativeAndroidPickerStyle={false}
                    placeholder={pickerPlaceholder}
                    value={value}
                    Icon={iconToRender}
                    disabled={isDisabled}
                    fixAndroidTouchableBug
                    onOpen={enableHighlight}
                    onClose={disableHighlight}
                    textInputProps={{
                        allowFontScaling: false,
                        importantForAccessibility: 'no-hide-descendants',
                    }}
                    touchableDoneProps={{
                        accessibilityRole: CONST.ROLE.BUTTON,
                        accessibilityLabel: translate('common.dismiss'),
                    }}
                    touchableWrapperProps={{
                        accessible: true,
                        accessibilityRole: CONST.ROLE.COMBOBOX,
                        accessibilityLabel: translate('languagePage.language'),
                        accessibilityState: {disabled: isDisabled, expanded: isHighlighted},
                    }}
                    pickerProps={{
                        ref: picker,
                        tabIndex: -1,
                        onFocus: enableHighlight,
                        onBlur: () => {
                            disableHighlight();
                            onBlur();
                        },
                        ...additionalPickerEvents(enableHighlight, (inputValue, index) => {
                            onValueChange(inputValue, index);
                            disableHighlight();
                        }),
                    }}
                    scrollViewRef={context?.scrollViewRef as RefObject<ScrollView>}
                    scrollViewContentOffsetY={context?.contentOffsetY}
                />
            </View>
            <FormHelpMessage message={errorText} />
            {!!hintText && <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{hintText}</Text>}
        </>
    );
}

export default BasePicker;
