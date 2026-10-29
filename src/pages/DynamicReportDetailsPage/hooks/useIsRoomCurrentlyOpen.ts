import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';

import {useFocusEffect} from '@react-navigation/native';
import {useState} from 'react';

function useIsRoomCurrentlyOpen(reportID: string | undefined): boolean {
    // Snapshot on focus whether the room is the screen behind the Details page, so the row doesn't flip while the page
    // is closing after it's tapped, yet still reflects the correct screen on later visits.
    const [isRoomCurrentlyOpen, setIsRoomCurrentlyOpen] = useState(() => isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === reportID);
    useFocusEffect(() => {
        setIsRoomCurrentlyOpen(isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === reportID);
    });

    return isRoomCurrentlyOpen;
}

export default useIsRoomCurrentlyOpen;
