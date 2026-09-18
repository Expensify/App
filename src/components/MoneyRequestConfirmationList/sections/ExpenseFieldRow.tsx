import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type ExpenseFieldRowProps = {
    /** Name of the field. Renders small above the value, or as the placeholder when there is no value */
    name: string;

    /** Value the field holds. Empty renders the row in its placeholder state */
    value?: string;

    /** Value the field holds when plain text can't express it, e.g. the attendee pills. Requires `accessibilityLabel` */
    valueComponent?: ReactNode;

    /** Whether `valueComponent` stands for a filled-in field. Ignored when `valueComponent` is not given */
    hasValueComponent?: boolean;

    /** Pre-computed label for the row. Required alongside `valueComponent`, which the row can't read text out of */
    accessibilityLabel?: string;

    /** Short trailing hint shown before the caret while the field is empty, e.g. `Required` */
    rightLabel?: string;

    /** Icon rendered before `rightLabel` */
    rightLabelIcon?: IconAsset;

    /** Error message rendered below the row. Also turns the row's border red, as it does on a text field */
    errorText?: string;

    /** Opens the field's selector. The caret is cosmetic: the row opens the same page the push row opened */
    onPress: () => void;

    /** Whether the row is pressed-through but visibly inert (e.g. while the expense is being confirmed) */
    isDisabled?: boolean;

    /** Whether the field can be changed at all. A non-interactive row loses its caret and its press handler */
    isInteractive?: boolean;

    sentryLabel?: string;
    testID?: string;
};

/**
 * A selectable row of the expense form, rendered as one of the form's bordered fields rather than as a push row:
 * the field name stands in for the value while the field is empty, and moves above the value once one is picked.
 *
 * Tapping it opens the same selector the push row opened. The caret only says the row holds a value to pick.
 */
function ExpenseFieldRow({
    name,
    value = '',
    valueComponent,
    hasValueComponent = false,
    accessibilityLabel,
    rightLabel = '',
    rightLabelIcon,
    errorText = '',
    onPress,
    isDisabled = false,
    isInteractive = true,
    sentryLabel,
    testID,
}: ExpenseFieldRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const hasValue = valueComponent ? hasValueComponent : !!value;
    // `Required` (and the automatic-category hint) answer "what goes here", so they go once the field holds a value.
    const shouldShowRightLabel = !!rightLabel && !hasValue;

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <MenuItem.Root
                style={[styles.moneyRequestFieldRow, !!errorText && styles.borderColorDanger]}
                onPress={isInteractive ? onPress : undefined}
                isDisabled={isDisabled}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={sentryLabel}
                testID={testID}
            >
                <MenuItem.Row>
                    <MenuItem.Content>
                        {hasValue ? (
                            <>
                                <MenuItem.FieldName numberOfLines={1}>{name}</MenuItem.FieldName>
                                {valueComponent ?? <MenuItem.FieldValue>{value}</MenuItem.FieldValue>}
                            </>
                        ) : (
                            <MenuItem.FieldNamePlaceholder numberOfLines={1}>{name}</MenuItem.FieldNamePlaceholder>
                        )}
                    </MenuItem.Content>
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
                </MenuItem.Row>
            </MenuItem.Root>
            {!!errorText && <FormHelpMessage message={errorText} />}
        </View>
    );
}

export default ExpenseFieldRow;
export type {ExpenseFieldRowProps};
