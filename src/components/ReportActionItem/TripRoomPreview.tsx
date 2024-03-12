import React, {useMemo} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as Expensicons from '@src/components/Icon/Expensicons';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import IconAsset from '@src/types/utils/IconAsset';

const reservations: Reservation[] = [];
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

    //   /** Extra styles to pass to View wrapper */
    //   containerStyles?: StyleProp<ViewStyle>;

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
            case 'flight':
                return Expensicons.Plane;
            case 'hotel':
                return Expensicons.Bed;
            case 'car':
                return Expensicons.CarWithKey;
            default:
                return Expensicons.CarWithKey;
        }
    }, [reservation.type]);

    return (
        <View style={[styles.flexRow, styles.mb3]}>
            <View style={{width: 32, height: 32, backgroundColor: '#E6E1DA', borderRadius: 32, marginRight: 8, alignItems: 'center', justifyContent: 'center'}}>
                <Icon
                    src={reservationIcon}
                    width={16}
                    height={16}
                    fill={theme.icon}
                />
            </View>
            <View style={{marginLeft: 2, justifyContent: 'space-between'}}>
                <Text style={[styles.textSupportingSmallSize]}>{translate(`travel.${reservation.type}`)}</Text>
                {reservation.type === 'flight' ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Text style={styles.labelStrong}>{reservation.start.shortName}</Text>
                        <Icon
                            additionalStyles={styles.mh1}
                            src={Expensicons.ArrowRightLong}
                            width={16}
                            height={16}
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

function TripRoomPreview({action, iouReportID}: TripRoomPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // const tripTransactions = ReportUtils.getTripTransactions(iouReportID);

    return (
        <OfflineWithFeedback
            // pendingAction={iouReport?.pendingFields?.preview}
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
            style={[styles.moneyRequestPreviewBox, {padding: 16}]}
        >
            <View style={[styles.chatItemMessage]}>
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
                                <Text style={styles.textHeadlineH1}>$1,439.21</Text>
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
                    renderItem={({item}: {item: Reservation}) => <ReservationRow reservation={item} />}
                    style={{marginVertical: 12}}
                />
                <Button
                    medium
                    success
                    text={translate('travel.viewTrip')}
                    onPress={() => {}}
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
