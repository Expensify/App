import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';

import CONST from '@src/CONST';

type CategoryFieldProps = {
    data: MoneyRequestViewData;
};

function CategoryField({data}: CategoryFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('category')}>
            <MenuItemWithTopDescription
                description={data.translate('common.category')}
                title={data.shouldShowCategoryAnalyzing ? data.translate('common.analyzing') : data.decodedCategoryName}
                numberOfLinesTitle={2}
                interactive={data.canEdit}
                shouldShowRightIcon={data.canEdit}
                titleStyle={data.styles.flex1}
                onPress={data.onCategoryPress}
                brickRoadIndicator={data.getErrorForField('category') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('category')}
                copyValue={data.categoryCopyValue}
                copyable={!!data.categoryCopyValue}
            />
        </OfflineWithFeedback>
    );
}

CategoryField.displayName = 'CategoryField';

export default CategoryField;
