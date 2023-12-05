import {RouteProp} from '@react-navigation/native';
import {getYear} from 'date-fns';
import React from 'react';
import YearPicker from '@components/YearPicker';
import ROUTES from '@src/ROUTES';

type MoneyRequestYearPageProps = {
    route: RouteProp<{params: {value: string; iouType: string; reportID?: string}}>;
};

function MoneyRequestYearPage({route}: MoneyRequestYearPageProps) {
    // const iouType = lodashGet(route, 'params.iouType', '');
    const iouType = route.params?.iouType;
    const reportID = route.params?.reportID;
    return (
        <YearPicker
            backTo={ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID)}
            maxYear={getYear(new Date())}
            route={route}
        />
    );
}

export default MoneyRequestYearPage;
