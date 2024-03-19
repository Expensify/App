import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {FlatList, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type {Reservation} from '@src/types/onyx/Transaction';

type TripRoomPreviewOnyxProps = {
    /** All the transactions, used to update ReportPreview label and status */
    // transactions: OnyxCollection<Transaction>;
};

type TripRoomPreviewProps = TripRoomPreviewOnyxProps & {
    /** All the data of the action */
    action: ReportAction;

    //   /** The associated chatReport */
    //   chatReportID: string;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string;

    //   /** The report's policyID, used for Onyx subscription */
    //   policyID: string;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    //   /** Popover context menu anchor, used for showing context menu */
    //   contextMenuAnchor?: ContextMenuAnchor;

    //   /** Callback for updating context menu active state, used for showing context menu */
    //   checkIfContextMenuActive?: () => void;

    //   /** Whether a message is a whisper */
    //   isWhisper?: boolean;

    //   /** Whether the corresponding report action item is hovered */
    //   isHovered?: boolean;
};

type ReservationRowProps = {
    reservation: Reservation;
};

function ReservationRow({reservation}: ReservationRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
        <View style={[styles.flexRow, styles.gap3]}>
            <View style={styles.tripReservationIconContainer}>
                <Icon
                    src={reservationIcon}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            </View>
            <View style={styles.tripReserviationInfoContainer}>
                <Text style={[styles.textSupportingSmallSize, styles.lh14]}>{translate(`travel.${reservation.type}`)}</Text>
                {reservation.type === CONST.RESERVATION_TYPE.FLIGHT ? (
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
                    <Text style={styles.labelStrong}>{reservation.start.address}</Text>
                )}
            </View>
        </View>
    );
}

function TripRoomPreview({action, iouReportID, containerStyles}: TripRoomPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tripTransactions = ReportUtils.getTripTransactions(iouReportID);

    const renderItem = ({item}: {item: Reservation}) => <ReservationRow reservation={item} />;

    const reservations: Reservation[] = tripTransactions
        .map((item) => item?.reservationList ?? [])
        .filter((item) => item.length > 0)
        .flat();

    return (
        <OfflineWithFeedback
            // pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
            style={[styles.moneyRequestPreviewBox]}
        >
            <View style={[styles.chatItemMessage, styles.p4, styles.gap5, containerStyles]}>
                <View style={styles.expenseAndReportPreviewTextContainer}>
                    <View style={styles.reportPreviewAmountSubtitleContainer}>
                        <View style={styles.flexRow}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <Text style={[styles.textLabelSupporting, styles.lh16]}>Trip • December 15-20 </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.reportPreviewAmountSubtitleContainer}>
                        <View style={styles.flexRow}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <Text style={styles.textHeadlineH2}>$1,439.21</Text>
                            </View>
                        </View>
                        <View style={styles.flexRow}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <Text style={[styles.textSupportingNormalSize, styles.lh20]}>Trip to San Francisco</Text>
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
        </OfflineWithFeedback>
    );
}

TripRoomPreview.displayName = 'TripRoomPreview';

export default withOnyx<TripRoomPreviewProps, TripRoomPreviewOnyxProps>({
    // transactions: {
    //     key: ONYXKEYS.COLLECTION.TRANSACTION,
    // },
})(TripRoomPreview);
