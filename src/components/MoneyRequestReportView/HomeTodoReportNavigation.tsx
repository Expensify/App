import PrevNextButtons from '@components/PrevNextButtons';

import openReportInPlace from '@libs/Navigation/helpers/openReportInPlace';

import React from 'react';

/**
 * Previous and next arrows for the reports of a Home to-do row. They page through the list fixed when the user pressed
 * `Begin` instead of search results, with the same controls the Spend report navigation uses.
 */

type HomeTodoReportNavigationProps = {
    /** The report open on screen */
    reportID: string;

    /** The reports of the Home to-do row the user is going through */
    reportIDs: string[];
};

function HomeTodoReportNavigation({reportID, reportIDs}: HomeTodoReportNavigationProps) {
    const currentIndex = reportIDs.indexOf(reportID);

    const goToReport = (nextReportID: string | undefined) => {
        if (!nextReportID) {
            return;
        }
        openReportInPlace(nextReportID);
    };

    if (currentIndex === -1 || reportIDs.length < 2) {
        return null;
    }

    return (
        <PrevNextButtons
            isPrevButtonDisabled={currentIndex === 0}
            isNextButtonDisabled={currentIndex === reportIDs.length - 1}
            onNext={() => goToReport(reportIDs.at(currentIndex + 1))}
            onPrevious={() => goToReport(reportIDs.at(currentIndex - 1))}
        />
    );
}

export default HomeTodoReportNavigation;
