import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import {View} from 'react-native';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

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
