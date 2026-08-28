import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';

type CardFieldProps = {
    data: MoneyRequestViewData;
};

function CardField({data}: CardFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('cardID')}>
            <MenuItemWithTopDescription
                description={data.translate('iou.card')}
                title={data.cardCopyValue}
                numberOfLinesTitle={2}
                titleStyle={data.styles.flex1}
                interactive={false}
                copyValue={data.cardCopyValue}
                copyable={!!data.cardCopyValue}
            />
        </OfflineWithFeedback>
    );
}

CardField.displayName = 'CardField';

export default CardField;
