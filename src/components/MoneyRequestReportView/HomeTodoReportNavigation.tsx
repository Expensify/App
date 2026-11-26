import PrevNextButtons from '@components/PrevNextButtons';

import useAvailableHomeTodoReportIDs from '@hooks/useAvailableHomeTodoReportIDs';
import useThemeStyles from '@hooks/useThemeStyles';

import {playHomeTodoReportTransition} from '@libs/HomeTodoReportTransition';
import openReportInPlace from '@libs/Navigation/helpers/openReportInPlace';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import MoneyRequestReportNavigationCounter from './MoneyRequestReportNavigationCounter';

/**
 * Previous and next arrows for the reports of a Home to-do row. They page through the list fixed when the user pressed
 * `Begin` instead of search results, with the same controls the Spend report navigation uses.
 */

type HomeTodoReportNavigationProps = {
    /** The report open on screen */
    reportID: string;

    /** The reports of the Home to-do row the user is going through */
    reportIDs: string[];

    /** Whether to show the "x of y" counter. A narrow header keeps only the arrows, as the Spend report navigation does. */
    shouldShowCounter: boolean;
};

function HomeTodoReportNavigation({reportID, reportIDs, shouldShowCounter}: HomeTodoReportNavigationProps) {
    const styles = useThemeStyles();
    const route = useRoute();
    const availableReportIDs = useAvailableHomeTodoReportIDs(reportID, reportIDs);
    const currentIndex = availableReportIDs.indexOf(reportID);

    const goToReport = (nextReportID: string | undefined) => {
        if (!nextReportID) {
            return;
        }
        playHomeTodoReportTransition(route.key, () => openReportInPlace(nextReportID));
    };

    if (currentIndex === -1 || availableReportIDs.length < 2) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            {shouldShowCounter && (
                <MoneyRequestReportNavigationCounter
                    current={currentIndex + 1}
                    total={availableReportIDs.length}
                />
            )}
            <PrevNextButtons
                isPrevButtonDisabled={currentIndex === 0}
                isNextButtonDisabled={currentIndex === availableReportIDs.length - 1}
                onNext={() => goToReport(availableReportIDs.at(currentIndex + 1))}
                onPrevious={() => goToReport(availableReportIDs.at(currentIndex - 1))}
            />
        </View>
    );
}

export default HomeTodoReportNavigation;
