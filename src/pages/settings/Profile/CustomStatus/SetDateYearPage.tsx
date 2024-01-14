import type {RouteProp} from '@react-navigation/native';
import {getYear} from 'date-fns';
import React from 'react';
import YearPicker from '@components/DatePicker/CalendarPicker/YearPicker';
import ROUTES from '@src/ROUTES';

type DOBYearSelectorProps = {
    route: RouteProp<{params: {value: string}}>;
};

function YearSelector({route}: DOBYearSelectorProps) {
    return (
        <YearPicker
            backTo={ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE}
            minYear={getYear(new Date())}
            maxYear={getYear(new Date()) + 100}
            route={route}
        />
    );
}

export default YearSelector;
