import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

type ExpenseFieldRowProps = {
    /** Name of the field. Renders small above the value, or as the placeholder when there is no value */
    name: string;

    /** Value the field holds. Empty renders the row in its placeholder state */
    value?: string;

    /** How many lines the value may take. Defaults to 1, and `0` lets it grow unbounded */
    numberOfLinesValue?: number;

    /** Value the field holds when plain text can't express it, e.g. the attendee pills. Requires `accessibilityLabel` */
    valueComponent?: ReactNode;

    /** Whether `valueComponent` stands for a filled-in field. Ignored when `valueComponent` is not given */
    hasValueComponent?: boolean;

    /** Pre-computed label for the row. Required alongside `valueComponent`, which the row can't read text out of */
    accessibilityLabel?: string;

    /** Short trailing hint shown before the caret, e.g. `Required` */
    rightLabel?: string;

    /** Icon rendered before `rightLabel` */
    rightLabelIcon?: IconAsset;

    /**
     * Whether `rightLabel` describes the value the field holds (e.g. `Automatic`, for a category Concierge picked)
     * rather than what is still missing from it, and so has to survive the field being filled in.
     */
    shouldKeepRightLabelWhenFilled?: boolean;

    /** Error message rendered below the row. Also turns the row's border red, as it does on a text field */
    errorText?: string;

    /** Explanatory message rendered below the row, e.g. the commuter mileage a distance row has already deducted */
    hintText?: string;

    /** Opens the field's selector. The caret is cosmetic: the row opens the same page the push row opened */
    onPress: () => void;

    /** Whether the row is pressed-through but visibly inert (e.g. while the expense is being confirmed) */
    isDisabled?: boolean;

    /** Whether the field can be changed at all. A non-interactive row drops its border, caret and press handler */
    isInteractive?: boolean;

    /**
     * Styles for the `Animated.View` wrapping the row, e.g. the highlight animation `HighlightableExpenseFieldRow`
     * runs. It is a layer of its own because the row paints its own background over anything drawn behind it, and
     * being the row's parent it fades the row's content along with the fill.
     */
    backgroundStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    sentryLabel?: string;
    testID?: string;
};

/**
 * A selectable row of the expense form, rendered as one of the form's bordered fields rather than as a push row:
 * the field name stands in for the value while the field is empty, and moves above the value once one is picked.
 *
 * Tapping it opens the same selector the push row opened. The caret only says the row holds a value to pick.
 *
 * A field nobody can change stays a field: it keeps the border and reads as a disabled input, losing only the
 * caret and the press handler. That rule lives here rather than in each caller so every locked field on the form
 * looks the same.
 */
function ExpenseFieldRow({
    name,
    value = '',
    numberOfLinesValue,
    valueComponent,
    hasValueComponent = false,
    accessibilityLabel,
    rightLabel = '',
    rightLabelIcon,
    shouldKeepRightLabelWhenFilled = false,
    errorText = '',
    hintText = '',
    onPress,
    isDisabled = false,
    isInteractive = true,
    backgroundStyle,
    sentryLabel,
    testID,
}: ExpenseFieldRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const hasValue = valueComponent ? hasValueComponent : !!value;
    // `Required` answers "what goes here", so it goes once the field holds a value. A label that describes the value
    // itself has to stay, or a field the app filled in reads as one the user chose.
    const shouldShowRightLabel = !!rightLabel && (shouldKeepRightLabelWhenFilled || !hasValue);
    const hasTrailing = shouldShowRightLabel || isInteractive;

    const row = (
        <MenuItem.Row>
            <MenuItem.Content>
                {hasValue ? (
                    <>
                        <MenuItem.FieldName numberOfLines={1}>{name}</MenuItem.FieldName>
                        {valueComponent ?? (
                            <MenuItem.FieldValue
                                numberOfLines={numberOfLinesValue}
                                isMuted={!isInteractive}
                            >
                                {value}
                            </MenuItem.FieldValue>
                        )}
                    </>
                ) : (
                    <MenuItem.FieldNamePlaceholder numberOfLines={1}>{name}</MenuItem.FieldNamePlaceholder>
                )}
            </MenuItem.Content>
            {hasTrailing && (
                <MenuItem.Trailing>
                    {shouldShowRightLabel && (
                        <>
                            {!!rightLabelIcon && (
                                <Icon
                                    src={rightLabelIcon}
                                    fill={theme.icon}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                />
                            )}
                            <MenuItem.RightLabel>{rightLabel}</MenuItem.RightLabel>
                        </>
                    )}
                    {isInteractive && <MenuItem.DownCaret />}
                </MenuItem.Trailing>
            )}
        </MenuItem.Row>
    );

    const messages = (
        <>
            {!!errorText && <FormHelpMessage message={errorText} />}
            {!!hintText && (
                <FormHelpMessage
                    isError={false}
                    shouldShowRedDotIndicator={false}
                    message={hintText}
                />
            )}
        </>
    );

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <Animated.View style={[styles.moneyRequestFieldRowFill, backgroundStyle]}>
                <MenuItem.Root
                    style={[styles.moneyRequestFieldRow, !isInteractive && styles.moneyRequestFieldRowDisabled, !!errorText && styles.borderColorDanger]}
                    // A locked field has nothing to open, so it is handed no press handler at all: `MenuItem.Root`
                    // reads that as a non-interactive row and drops the button role and the focus stop with it.
                    // Otherwise the press is guarded like every other `MenuItem` preset, so an anonymous user gets
                    // the sign-in prompt rather than the field's selector.
                    onPress={isInteractive ? callFunctionIfActionIsAllowed(onPress) : undefined}
                    isDisabled={isDisabled}
                    accessibilityLabel={accessibilityLabel}
                    sentryLabel={sentryLabel}
                    testID={testID}
                >
                    {row}
                </MenuItem.Root>
            </Animated.View>
            {messages}
        </View>
    );
}

export default ExpenseFieldRow;
export type {ExpenseFieldRowProps};
