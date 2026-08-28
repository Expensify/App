import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';

import {View} from 'react-native';

type TripFieldProps = {
    data: MoneyRequestViewData;
};

function TripField({data}: TripFieldProps) {
    return (
        <>
            <MenuItemWithTopDescription
                title={data.tripRoomName}
                description={data.translate('travel.trip')}
                style={[data.styles.moneyRequestMenuItem]}
                titleStyle={data.styles.flex1}
                numberOfLinesTitle={2}
                shouldShowRightIcon
                onPress={data.onTripRoomPress}
                interactive
            />
            <View style={data.styles.reportHorizontalRule} />
        </>
    );
}

TripField.displayName = 'TripField';

export default TripField;
