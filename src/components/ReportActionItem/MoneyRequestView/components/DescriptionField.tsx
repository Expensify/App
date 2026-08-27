import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type DescriptionFieldProps = {
    data: MoneyRequestViewData;
};

function DescriptionField({data}: DescriptionFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('comment')}>
            <MenuItemWithTopDescription
                description={data.translate('common.description')}
                shouldRenderAsHTML
                title={data.updatedTransactionDescription ?? data.transactionDescription}
                interactive={data.canEdit}
                shouldShowRightIcon={data.canEdit}
                titleStyle={data.styles.flex1}
                onPress={data.onDescriptionPress}
                wrapperStyle={[data.styles.pv2, data.styles.taskDescriptionMenuItem]}
                brickRoadIndicator={data.getErrorForField('comment') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('comment')}
                numberOfLinesTitle={0}
                copyValue={data.descriptionCopyValue}
                copyable={!!data.descriptionCopyValue}
            />
        </OfflineWithFeedback>
    );
}

DescriptionField.displayName = 'DescriptionField';

export default DescriptionField;
