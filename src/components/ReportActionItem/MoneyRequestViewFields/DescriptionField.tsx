// Preserves rich expense descriptions alongside their offline and validation feedback.
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type DescriptionFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'errorText' | 'copyValue' | 'onPress'> & {
        canEdit: boolean;
    };

function DescriptionField({pendingAction, title, errorText, copyValue, onPress, canEdit}: DescriptionFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemWithTopDescription
                description={translate('common.description')}
                shouldRenderAsHTML
                title={title}
                interactive={canEdit}
                shouldShowRightIcon={canEdit}
                titleStyle={styles.flex1}
                onPress={onPress}
                wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                numberOfLinesTitle={0}
                copyValue={copyValue}
                copyable={!!copyValue}
            />
        </OfflineWithFeedback>
    );
}

export default DescriptionField;
