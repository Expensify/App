/** Displays the expense amount with its payment status and editing or copy actions. */
import Icon from '@components/Icon';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import EditableField from './EditableField';

type AmountFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'description' | 'hintText' | 'errorText' | 'copyValue' | 'onPress'> & {
        /** Enables the amount editor. Otherwise the value can only be copied. */
        canEdit?: boolean;

        /** Adds a checkmark when the reimbursable expense has been paid. */
        shouldShowPaid?: boolean;
    };

function AmountField({pendingAction, title, description, hintText, errorText, copyValue, onPress, canEdit, shouldShowPaid}: AmountFieldProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    return (
        <EditableField.Root
            pendingAction={pendingAction}
            accessibilityLabel={`${description ?? ''}, ${title ?? ''}`}
            onPress={canEdit ? onPress : undefined}
            shouldAllowTextSelection={!!copyValue}
        >
            <MenuItem.Row>
                <MenuItemField.Content name={description ?? ''}>
                    {title ? (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                            <Text
                                variant="h2"
                                numberOfLines={2}
                                dataSet={copyValue ? COPYABLE_TEXT_DATA_SET : undefined}
                            >
                                {title}
                            </Text>
                            {!!shouldShowPaid && (
                                <Icon
                                    src={icons.Checkmark}
                                    fill={theme.iconSuccessFill}
                                />
                            )}
                        </View>
                    ) : undefined}
                </MenuItemField.Content>
                <EditableField.Actions>
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
                </EditableField.Actions>
            </MenuItem.Row>
            {!!hintText && <MenuItem.HelpText message={hintText} />}
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </EditableField.Root>
    );
}

export default AmountField;
