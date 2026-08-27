import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type ReportFieldProps = {
    data: MoneyRequestViewData;
};

function ReportField({data}: ReportFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('reportID')}>
            <MenuItemWithTopDescription
                shouldShowRightIcon={data.canEditReport}
                title={data.reportNameToDisplay}
                description={data.translate('common.report')}
                style={[data.styles.moneyRequestMenuItem]}
                titleStyle={data.styles.flex1}
                onPress={data.onReportPress}
                interactive={data.canEditReport}
                shouldRenderAsHTML
                copyValue={data.reportCopyValue}
                copyable={!!data.reportCopyValue}
            />
        </OfflineWithFeedback>
    );
}

ReportField.displayName = 'ReportField';

export default ReportField;
