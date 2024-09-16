import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {getReportActionText} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TripReservationUtils from '@libs/TripReservationUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

type TripRoomPreviewProps = {
    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

type ReservationViewProps = {
    reservation: Reservation;
};

function ReservationView({reservation}: ReservationViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const reservationIcon = TripReservationUtils.getTripReservationIcon(reservation.type);
    const title = reservation.type === CONST.RESERVATION_TYPE.CAR ? reservation.carInfo?.name : reservation.start.longName;

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
                {title}
            </Text>
        );

    return (
        <MenuItemWithTopDescription
            description={translate(`travel.${reservation.type}`)}
            descriptionTextStyle={styles.textMicro}
            titleComponent={titleComponent}
            titleContainerStyle={styles.gap1}
            secondaryIcon={reservationIcon}
            secondaryIconFill={theme.icon}
            wrapperStyle={[styles.taskDescriptionMenuItem, styles.p0]}
            shouldGreyOutWhenDisabled={false}
            numberOfLinesTitle={0}
            interactive={false}
            iconHeight={variables.iconSizeSmall}
            iconWidth={variables.iconSizeSmall}
            iconStyles={[StyleUtils.getTripReservationIconContainer(true), styles.mr3]}
            isSmallAvatarSubscriptMenu
        />
    );
}

const renderItem = ({item}: {item: Reservation}) => <ReservationView reservation={item} />;

function TripRoomPreview({action, chatReportID, containerStyles, contextMenuAnchor, isHovered = false, checkIfContextMenuActive = () => {}}: TripRoomPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReport?.iouReportID}`);

    const tripTransactions = ReportUtils.getTripTransactions(chatReport?.iouReportID, 'reportID');
    const reservations: Reservation[] = TripReservationUtils.getReservationsFromTripTransactions(tripTransactions);
    const dateInfo = chatReport?.tripData ? DateUtils.getFormattedDateRange(new Date(chatReport.tripData.startDate), new Date(chatReport.tripData.endDate)) : '';
    const {totalDisplaySpend} = ReportUtils.getMoneyRequestSpendBreakdown(chatReport);

    const displayAmount = useMemo(() => {
        if (totalDisplaySpend) {
            return CurrencyUtils.convertToDisplayString(totalDisplaySpend, iouReport?.currency);
        }

        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmountValue = '';
        const actionMessage = getReportActionText(action) ?? '';
        const splits = actionMessage.split(' ');

        splits.forEach((split) => {
            if (!/\d/.test(split)) {
                return;
            }

            displayAmountValue = split;
        });

        return displayAmountValue;
    }, [action, iouReport?.currency, totalDisplaySpend]);

    return (
        <OfflineWithFeedback
            pendingAction={action?.pendingAction}
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
                    <View style={[styles.moneyRequestPreviewBox, styles.p4, styles.gap5, isHovered ? styles.reportPreviewBoxHoverBorder : undefined]}>
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
                                        <Text style={[styles.textLabelSupporting, styles.textNormal, styles.lh20]}>{chatReport?.reportName}</Text>
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
                            success
                            text={translate('travel.viewTrip')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(chatReportID))}
                        />
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

TripRoomPreview.displayName = 'TripRoomPreview';

export default TripRoomPreview;
