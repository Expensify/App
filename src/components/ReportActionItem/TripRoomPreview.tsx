import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {FlatList, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';
import type {BasicTripInfo} from '@src/types/onyx/TripDetails';

// @TODO: Dummy data used for testing purposes only. Remove when real data is available for testing.
const basicTripInfo: BasicTripInfo = {
    tripId: '6926658168',
    tripName: 'JFK SFO Trip',
    tripDescription: 'JFK SFO Business Trip',
    applicationId: '97ab27fa-30e2-43e3-92a3-160e80f4c0d5',
    startDate: {
        iso8601: '2017-05-1',
    },
    endDate: {
        iso8601: '2017-05-28',
    },
};

type TripRoomPreviewOnyxProps = {
    /** Active IOU Report for current report */
    iouReport: OnyxEntry<Report>;
};

type TripRoomPreviewProps = TripRoomPreviewOnyxProps & {
    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

type ReservationRowProps = {
    reservation: Reservation;
};

function ReservationRow({reservation}: ReservationRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation.type);

    const titleComponent =
        reservation.type === CONST.RESERVATION_TYPE.FLIGHT ? (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                <Text style={styles.labelStrong}>{reservation.start.shortName}</Text>
                <Icon
                    src={Expensicons.ArrowRightLong}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
                <Text style={styles.labelStrong}>{reservation.end.shortName}</Text>
            </View>
        ) : (
            <Text
                numberOfLines={1}
                style={styles.labelStrong}
            >
                {reservation.start.address}
            </Text>
        );

    return (
        <MenuItemWithTopDescription
            description={translate(`travel.${reservation.type}`)}
            descriptionTextStyle={[styles.textSupportingSmallSize, styles.lh14]}
            titleComponent={titleComponent}
            titleContainerStyle={styles.tripReservationTitleGap}
            secondaryIcon={reservationIcon}
            shouldShowRightIcon={false}
            wrapperStyle={[styles.taskDescriptionMenuItem, styles.p0]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            interactive={false}
            shouldStackHorizontally={false}
            hoverAndPressStyle={false}
            iconHeight={variables.iconSizeSmall}
            iconWidth={variables.iconSizeSmall}
            iconStyles={[styles.tripReservationIconContainer, styles.mr3]}
            secondaryIconFill={theme.icon}
            isSmallAvatarSubscriptMenu
        />
    );
}
function TripRoomPreview({
    iouReport,
    action,
    chatReportID,
    iouReportID,
    containerStyles,
    contextMenuAnchor,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
}: TripRoomPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tripTransactions = ReportUtils.getTripTransactions(iouReportID);

    const renderItem = ({item}: {item: Reservation}) => <ReservationRow reservation={item} />;

    const reservations: Reservation[] = TripReservationUtils.getReservationsFromTripTransactions(tripTransactions);

    const dateInfo = DateUtils.getFormattedDateRange(new Date(basicTripInfo.startDate.iso8601), new Date(basicTripInfo.endDate.iso8601));

    const displayAmount = useMemo(() => {
        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmountValue = '';
        const actionMessage = action.message?.[0]?.text ?? '';
        const splits = actionMessage.split(' ');

        splits.forEach((split) => {
            if (!/\d/.test(split)) {
                return;
            }

            displayAmountValue = split;
        });

        return displayAmountValue;
    }, [action]);

    return (
        <OfflineWithFeedback
            pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    shouldUseHapticsOnLongPress
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox, styles.cursorDefault]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <View style={[styles.moneyRequestPreviewBox, styles.p4, styles.gap5, isHovered || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        <View style={styles.expenseAndReportPreviewTextContainer}>
                            <View style={styles.reportPreviewAmountSubtitleContainer}>
                                <View style={styles.flexRow}>
                                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={[styles.textLabelSupporting, styles.lh16]}>
                                            {translate('travel.trip')} • {dateInfo}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.reportPreviewAmountSubtitleContainer}>
                                <View style={styles.flexRow}>
                                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={styles.textHeadlineH2}>{displayAmount}</Text>
                                    </View>
                                </View>
                                <View style={styles.flexRow}>
                                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={[styles.textSupportingNormalSize, styles.lh20]}>{basicTripInfo.tripName}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <FlatList
                            data={reservations}
                            style={styles.gap3}
                            renderItem={renderItem}
                        />
                        <Button
                            medium
                            success
                            text={translate('travel.viewTrip')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID))}
                        />
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

TripRoomPreview.displayName = 'TripRoomPreview';

export default withOnyx<TripRoomPreviewProps, TripRoomPreviewOnyxProps>({
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
})(TripRoomPreview);
