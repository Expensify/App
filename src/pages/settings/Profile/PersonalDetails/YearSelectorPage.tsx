import {RouteProp} from '@react-navigation/native';
import {getYear, subYears} from 'date-fns';
import React from 'react';
import YearPicker from '@components/YearPicker';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type DOBYearSelectorProps = {
    route: RouteProp<{params: {value: string}}>;
};

function DOBYearSelector({route}: DOBYearSelectorProps) {
    return (
        <YearPicker
            backTo={ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH}
            minYear={getYear(new Date(subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)))}
            maxYear={getYear(new Date(subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)))}
            route={route}
        />
    );
}

export default DOBYearSelector;
