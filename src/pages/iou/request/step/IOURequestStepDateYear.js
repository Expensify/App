import {getYear} from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import YearPicker from '@components/DatePicker/CalendarPicker/YearPicker';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string.isRequired,
            backTo: PropTypes.string.isRequired,
            transactionID: PropTypes.string.isRequired,
            reportID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
};

function IOURequestStepDateYear({route}) {
    const {iouType, backTo, transactionID, reportID} = route.params;
    return (
        <YearPicker
            backTo={ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(iouType, transactionID, reportID, backTo)}
            maxYear={getYear(CONST.CALENDAR_PICKER.MAX_DATE)}
            minYear={getYear(CONST.CALENDAR_PICKER.MIN_DATE)}
            route={route}
        />
    );
}

IOURequestStepDateYear.propTypes = propTypes;
IOURequestStepDateYear.displayName = 'IOURequestStepDateYear';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepDateYear));
