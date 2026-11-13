import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import StatusBadge from '@components/StatusBadge';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTripTransactions from '@hooks/useTripTransactions';

import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {canApproveAnyBooking, getBookingStatusBadge} from '@libs/TravelApprovalUtils';
import type {ReservationData, ReservationPNRData} from '@libs/TripReservationUtils';
import {
    formatCancelledDescription,
    getBookingTitle,
    getPNRReservationDataFromTripReport,
    getReservationsFromTripReport,
    getTripReservationIcon,
    getTripTotal,
} from '@libs/TripReservationUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';
import type {Reservation} from '@src/types/onyx/Transaction';

import type {ListRenderItemInfo, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React from 'react';
import {FlatList, View} from 'react-native';

type TripRoomPreviewProps = {
    action: ReportAction;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

const selectCurrency = (report: OnyxEntry<Report>) => report?.currency;

type ReservationViewProps = {
    reservation: Reservation;
    onPress?: () => void;
    isCancelled?: boolean;
};

function ReservationView({reservation, onPress, isCancelled}: ReservationViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plane', 'PlaneCircleSlash', 'Bed', 'BedCircleSlash', 'CarWithKey', 'CarCircleSlash', 'Train', 'TrainCircleSlash', 'Luggage']);

    const reservationIcon = getTripReservationIcon(expensifyIcons, reservation.type, isCancelled);
    const title = reservation.type === CONST.RESERVATION_TYPE.CAR ? reservation.carInfo?.name : Str.recapitalize(reservation.start.longName ?? '');

    const description = translate(`travel.${reservation.type}`);

    const titleStyle = [styles.mt1, isCancelled && styles.textSupporting];

    let titleComponent = (
        <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={titleStyle}
        >
            {title}
        </Text>
    );

    if (reservation.type === CONST.RESERVATION_TYPE.FLIGHT || reservation.type === CONST.RESERVATION_TYPE.TRAIN) {
        const startName = reservation.type === CONST.RESERVATION_TYPE.FLIGHT ? reservation.start.shortName : reservation.start.longName;
        const endName = reservation.type === CONST.RESERVATION_TYPE.FLIGHT ? reservation.end.shortName : reservation.end.longName;

        titleComponent = (
            <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={titleStyle}
            >
                {startName} {translate('common.to').toLowerCase()} {endName}
            </Text>
        );
    }

    const displayDescription = formatCancelledDescription(translate('iou.canceled'), description, isCancelled);

    return (
        <MenuItemWithTopDescription
            sentryLabel={CONST.SENTRY_LABEL.TRIP_ROOM_PREVIEW.RESERVATION}
            description={displayDescription}
            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
            titleComponent={titleComponent}
            accessibilityLabel={isCancelled ? displayDescription : undefined}
            secondaryIcon={reservationIcon}
            secondaryIconFill={theme.icon}
            wrapperStyle={[styles.taskDescriptionMenuItem, styles.p0]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            shouldRemoveBackground
            onPress={onPress}
            iconHeight={variables.iconSizeNormal}
            iconWidth={variables.iconSizeNormal}
            iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3, styles.alignSelfCenter]}
            isSmallAvatarSubscriptMenu
        />
    );
}

type BookingViewProps = {
    booking: ReservationPNRData;

    /** The booking's approval state, which sets its status badge */
    bookingApproval?: BookingApproval;

    onPress: () => void;
};

function BookingView({booking, bookingApproval, onPress}: BookingViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plane', 'PlaneCircleSlash', 'Bed', 'BedCircleSlash', 'CarWithKey', 'CarCircleSlash', 'Train', 'TrainCircleSlash', 'Luggage']);

    const firstReservation = booking.reservations.at(0)?.reservation;
    const isCancelled = booking.reservations.every((reservation) => reservation.isCancelled);
    const statusBadge = getBookingStatusBadge(translate, theme.reportStatusBadge, bookingApproval);
    const description = formatCancelledDescription(translate('iou.canceled'), firstReservation ? translate(`travel.${firstReservation.type}`) : '', isCancelled);

    return (
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Matches the reservation rows above; the compound MenuItem has no leaf for the trip reservation icon.
        <MenuItemWithTopDescription
            sentryLabel={CONST.SENTRY_LABEL.TRIP_ROOM_PREVIEW.BOOKING}
            description={description}
            descriptionTextStyle={[styles.textLabelSupporting, styles.lh16]}
            title={getBookingTitle(translate, booking.reservations)}
            titleStyle={[styles.mt1, isCancelled && styles.textSupporting]}
            numberOfLinesTitle={1}
            accessibilityLabel={isCancelled ? description : undefined}
            secondaryIcon={getTripReservationIcon(expensifyIcons, firstReservation?.type, isCancelled)}
            secondaryIconFill={theme.icon}
            wrapperStyle={[styles.taskDescriptionMenuItem, styles.p0]}
            shouldGreyOutWhenDisabled={false}
            shouldRemoveBackground
            onPress={onPress}
            iconHeight={variables.iconSizeNormal}
            iconWidth={variables.iconSizeNormal}
            iconStyles={[StyleUtils.getTripReservationIconContainer(false), styles.mr3, styles.alignSelfCenter]}
            isSmallAvatarSubscriptMenu
            shouldShowRightComponent={!!statusBadge}
            rightComponent={
                !!statusBadge && (
                    <StatusBadge
                        text={statusBadge.text}
                        backgroundColor={statusBadge.backgroundColor}
                        textColor={statusBadge.textColor}
                        badgeStyles={styles.ml3}
                    />
                )
            }
        />
    );
}

function TripRoomPreview({action, containerStyles, isHovered = false}: TripRoomPreviewProps) {
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {anchor: contextMenuAnchorRef, shouldDisplayContextMenu = true, originalReportID} = useShowContextMenuState();
    const {checkIfContextMenuActive} = useShowContextMenuActions();

    const originalMessage = getOriginalMessage(action);
    const linkedReportID = originalMessage && 'linkedReportID' in originalMessage ? originalMessage.linkedReportID : undefined;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${linkedReportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReport?.reportID ?? linkedReportID}`);
    const [iouReportCurrency] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReport?.iouReportID}`, {selector: selectCurrency});

    const chatReportID = chatReport?.reportID ?? linkedReportID;
    const tripTransactions = useTripTransactions(chatReportID);

    // With travel approval, the preview lists bookings (the unit approvers decide on) instead of flight legs
    const isTravelApprovalEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_APPROVAL);
    const reservationsData: ReservationData[] = isTravelApprovalEnabled ? [] : getReservationsFromTripReport(chatReport, reportNameValuePairs, tripTransactions);
    const bookingsData: ReservationPNRData[] = isTravelApprovalEnabled ? getPNRReservationDataFromTripReport(chatReport, reportNameValuePairs, tripTransactions) : [];
    const shouldShowReview = isTravelApprovalEnabled && canApproveAnyBooking(reportNameValuePairs?.tripData, currentUserAccountID);
    const dateInfo =
        reportNameValuePairs?.tripData?.startDate && reportNameValuePairs?.tripData?.endDate
            ? DateUtils.getFormattedDateRange(translate, dateFnsLocale, new Date(reportNameValuePairs.tripData.startDate), new Date(reportNameValuePairs.tripData.endDate))
            : '';
    const reportCurrency = iouReportCurrency ?? chatReport?.currency;

    const {totalDisplaySpend = 0, currency = reportCurrency} = chatReport ? getTripTotal(chatReport, reportNameValuePairs) : {};

    const displayAmount = totalDisplaySpend
        ? convertToDisplayString(totalDisplaySpend, currency)
        : convertToDisplayString(
              tripTransactions?.reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0),
              currency,
          );

    const navigateToTrip = () => Navigation.navigate(getReportRouteForCurrentContext({reportID: chatReportID}));
    const renderItem = ({item}: ListRenderItemInfo<ReservationData>) => (
        <ReservationView
            reservation={item.reservation}
            onPress={navigateToTrip}
            isCancelled={item.isCancelled}
        />
    );

    const renderBooking = ({item}: ListRenderItemInfo<ReservationPNRData>) => (
        <BookingView
            booking={item}
            bookingApproval={reportNameValuePairs?.tripData?.bookingApprovalState?.[item.pnrID]}
            onPress={navigateToTrip}
        />
    );

    const reservationCount = isTravelApprovalEnabled
        ? translate('travel.bookingCount', {count: bookingsData.length})
        : `${reservationsData.length} ${(reservationsData.length < 2 ? translate('travel.trip') : translate('travel.trips')).toLowerCase()}`;

    return (
        <OfflineWithFeedback
            pendingAction={action?.pendingAction}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPress={navigateToTrip}
                    onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => {
                        if (!shouldDisplayContextMenu) {
                            return;
                        }
                        showContextMenuForReport(event, contextMenuAnchorRef, chatReportID, action, checkIfContextMenuActive, originalReportID);
                    }}
                    shouldUseHapticsOnLongPress
                    sentryLabel={CONST.SENTRY_LABEL.TRIP_ROOM_PREVIEW.CARD}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.moneyRequestPreviewBox, styles.p4, styles.gap4, isHovered ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        <View>
                            <Text style={[styles.headerText, styles.mb1]}>{chatReport?.reportName}</Text>
                            <Text style={[styles.textLabelSupporting, styles.lh16]}>
                                {dateInfo} • {reservationCount}
                            </Text>
                        </View>
                        {reservationsData.length > 0 && (
                            <FlatList
                                data={reservationsData}
                                style={[styles.border, styles.borderRadiusComponentLarge, styles.p4, styles.flexGrow0]}
                                contentContainerStyle={styles.gap4}
                                renderItem={renderItem}
                            />
                        )}
                        {bookingsData.length > 0 && (
                            <FlatList
                                data={bookingsData}
                                keyExtractor={(item) => item.pnrID}
                                style={[styles.border, styles.borderRadiusComponentLarge, styles.p4, styles.flexGrow0]}
                                contentContainerStyle={styles.gap4}
                                renderItem={renderBooking}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                            <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate('common.total')}</Text>
                            <Text style={[styles.headerText, styles.lineHeightXLarge]}>{displayAmount}</Text>
                        </View>

                        <Button
                            variant={shouldShowReview ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                            onPress={navigateToTrip}
                            sentryLabel={CONST.SENTRY_LABEL.TRIP_ROOM_PREVIEW.VIEW_BUTTON}
                        >
                            <Button.Text>{shouldShowReview ? translate('common.review') : translate('common.view')}</Button.Text>
                        </Button>
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

export default TripRoomPreview;
