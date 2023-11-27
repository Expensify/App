import {RouteProp} from '@react-navigation/native';
import {getYear} from 'date-fns';
import React from 'react';
import YearPicker from '@components/YearPicker';
import ROUTES from '@src/ROUTES';

type MoneyRequestYearPageProps = {
    route: RouteProp<{params: {value: string}}>;
};

function MoneyRequestYearPage({route}: MoneyRequestYearPageProps) {
    return (
        <YearPicker
            backTo={ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH}
            maxYear={getYear(new Date())}
            route={route}
        />
    );
}

export default MoneyRequestYearPage;
