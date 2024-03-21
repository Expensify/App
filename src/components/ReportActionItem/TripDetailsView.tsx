import React, {useMemo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportUtils from '@libs/ReportUtils';
import AnimatedEmptyStateBackground from '@pages/home/report/AnimatedEmptyStateBackground';
import {ThemeStyles} from '@styles/index';
import {ThemeColors} from '@styles/theme/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Reservation} from '@src/types/onyx/Transaction';

type TripDetailsViewProps = {
    /** The active IOUReport, used for Onyx subscription */
    iouReportID?: string;
};

type ReservationViewProps = {
    reservation: Reservation;
};

function ReservationView({reservation}: ReservationViewProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    const reservationIcon = useMemo(() => {
        switch (reservation.type) {
            case CONST.RESERVATION_TYPE.FLIGHT:
                return Expensicons.Plane;
            case CONST.RESERVATION_TYPE.HOTEL:
                return Expensicons.Bed;
            case CONST.RESERVATION_TYPE.CAR:
                return Expensicons.CarWithKey;
            default:
                return Expensicons.CarWithKey;
        }
    }, [reservation.type]);

    return (
        <MenuItemWithTopDescription
            description="abc"
            title="cde"
            icon={reservationIcon}
            //onPress={() => Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report.reportID, report.policyID ?? '', reportField.fieldID))}
            shouldShowRightIcon
            //disabled={isFieldDisabled}
            wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            interactive
            shouldStackHorizontally={false}
            onSecondaryInteraction={() => {}}
            hoverAndPressStyle={false}
            titleWithTooltips={[]}
        />
    );
}

function TripDetailsView({iouReportID}: TripDetailsViewProps) {
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const reservations: Reservation[] = ReportUtils.getTripTransactions(iouReportID)
        .map((item): Reservation[] => item?.reservationList ?? [])
        .filter((item) => item.length > 0)
        .flat();

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth, true)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth, true)]}>
                <>
                    {reservations.map((reservation) => (
                        <OfflineWithFeedback>
                            <ReservationView reservation={reservation} />
                        </OfflineWithFeedback>
                    ))}
                </>
            </View>
        </View>
    );
}

TripDetailsView.displayName = 'TripDetailsView';

export default TripDetailsView;
