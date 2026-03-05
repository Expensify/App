import React from 'react';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import UpcomingTravelItem from './UpcomingTravelItem';
import useUpcomingTravelReservations from './useUpcomingTravelReservations';

function UpcomingTravelSection() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const upcomingReservations = useUpcomingTravelReservations();

    if (upcomingReservations.length === 0) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate('homePage.upcomingTravel')}
            containerStyles={shouldUseNarrowLayout ? styles.pb2 : styles.pb5}
        >
            {upcomingReservations.map((reservation) => (
                <UpcomingTravelItem
                    key={`${reservation.reportID}-${reservation.sequenceIndex}`}
                    reservation={reservation}
                />
            ))}
        </WidgetContainer>
    );
}

export default UpcomingTravelSection;
