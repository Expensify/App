import StatusBadge from '@components/StatusBadge';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SearchTrip} from '@src/types/onyx/SearchResults';

import React from 'react';
import {View} from 'react-native';

type TripStatusCellProps = {
    status: SearchTrip['status'];
};

function TripStatusCell({status}: TripStatusCellProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    if (!status) {
        return null;
    }

    const badgeColors = {
        [CONST.SEARCH.TRIP_STATUS.UPCOMING]: theme.reportStatusBadge.approved,
        [CONST.SEARCH.TRIP_STATUS.DONE]: theme.reportStatusBadge.paid,
        [CONST.SEARCH.TRIP_STATUS.CANCELED]: theme.reportStatusBadge.unreported,
    }[status];

    return (
        <View style={[styles.w100, styles.justifyContentCenter]}>
            <StatusBadge
                text={translate(`search.trip.status.${status}`)}
                backgroundColor={badgeColors.backgroundColor}
                textColor={badgeColors.textColor}
            />
        </View>
    );
}

export default TripStatusCell;
