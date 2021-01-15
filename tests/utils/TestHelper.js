import _ from 'underscore';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from './waitForPromisesToResolve';
import {fetchAll as fetchAllReports} from '../../src/libs/actions/Report';
import {fetch as fetchPersonalDetails} from '../../src/libs/actions/PersonalDetails';

function fetchAllReportsAndPersonalDetails(reports, additionalPersonalDetails) {
    HttpUtils.xhr = jest.fn();

    // Fetch the chatList
    HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
        chatList: _.map(reports, report => report.reportID).join(','),
    }));

    // Fetch the reports
    HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
        reports,
    }));

    // Fetch each report's personalDetails - we are just sticking them on the report
    _.each(reports, report => {
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            ...report.personalDetails,
        }));
    });

    fetchAllReports();

    // Fetch personal details
    HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
        personalDetailsList: additionalPersonalDetails,
    }));

    fetchPersonalDetails();
    return waitForPromisesToResolve();
}

export {
    fetchAllReportsAndPersonalDetails,
};
