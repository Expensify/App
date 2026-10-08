// Displays the expense amount with its payment status and editing feedback.
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type AmountFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'description' | 'hintText' | 'errorText' | 'copyValue' | 'onPress'> & {
        canEdit?: boolean;
        shouldShowPaid?: boolean;
    };

function AmountField({pendingAction, title, description, hintText, errorText, copyValue, onPress, canEdit, shouldShowPaid}: AmountFieldProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemWithTopDescription
                title={title}
                shouldShowTitleIcon={shouldShowPaid}
                titleIcon={icons.Checkmark}
                description={description}
                hintText={hintText}
                titleStyle={styles.textHeadlineH2}
                numberOfLinesTitle={2}
                interactive={canEdit}
                shouldShowRightIcon={canEdit}
                onPress={onPress}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                copyValue={copyValue}
                copyable={!!copyValue}
            />
        </OfflineWithFeedback>
    );
}

export default AmountField;
