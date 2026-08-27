import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type ViewTripDetailsActionProps = {
    data: MoneyRequestViewData;
};

function ViewTripDetailsAction({data}: ViewTripDetailsActionProps) {
    return (
        <MenuItemAction
            title={data.translate('travel.viewTripDetails')}
            icon={data.icons.Suitcase}
            onPress={data.onViewTripDetailsPress}
        />
    );
}

ViewTripDetailsAction.displayName = 'ViewTripDetailsAction';

export default ViewTripDetailsAction;
