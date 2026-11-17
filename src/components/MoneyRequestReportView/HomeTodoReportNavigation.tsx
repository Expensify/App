import PrevNextButtons from '@components/PrevNextButtons';

import useThemeStyles from '@hooks/useThemeStyles';

import openReportInPlace from '@libs/Navigation/helpers/openReportInPlace';

import React from 'react';
import {View} from 'react-native';

import MoneyRequestReportNavigationCounter from './MoneyRequestReportNavigationCounter';

/**
 * Previous and next arrows with an `x of y` counter for the reports of a Home to-do row. It pages through the list
 * fixed when the user pressed `Begin` instead of search results, with the same controls the Spend report navigation uses.
 */

type HomeTodoReportNavigationProps = {
    /** The report open on screen */
    reportID: string;

    /** The reports of the Home to-do row the user is going through */
    reportIDs: string[];

    /** Whether to hide the counter and show only the arrows, as the Spend report navigation does on narrow headers */
    shouldDisplayNarrowVersion: boolean;
};

function HomeTodoReportNavigation({reportID, reportIDs, shouldDisplayNarrowVersion}: HomeTodoReportNavigationProps) {
    const styles = useThemeStyles();
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
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {!shouldDisplayNarrowVersion && (
                <MoneyRequestReportNavigationCounter
                    current={currentIndex + 1}
                    total={reportIDs.length}
                />
            )}
            <PrevNextButtons
                isPrevButtonDisabled={currentIndex === 0}
                isNextButtonDisabled={currentIndex === reportIDs.length - 1}
                onNext={() => goToReport(reportIDs.at(currentIndex + 1))}
                onPrevious={() => goToReport(reportIDs.at(currentIndex - 1))}
            />
        </View>
    );
}

export default HomeTodoReportNavigation;
