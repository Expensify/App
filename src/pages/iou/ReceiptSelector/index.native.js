import {Text, View} from 'react-native';
import React, {useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {PressableWithFeedback} from '../../../components/Pressable';
import Colors from '../../../styles/colors';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import styles from '../../../styles/styles';
import Shutter from '../../../../assets/images/shutter.svg';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import * as IOU from '../../../libs/actions/IOU';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import _ from 'underscore';
import * as ReportUtils from '../../../libs/ReportUtils';
import lodashGet from 'lodash/get';

function ReceiptSelector(props) {
    const devices = useCameraDevices();
    const device = devices.back;
    const camera = useRef(null);

    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const navigateToNextPage = () => {
        const moneyRequestID = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestID;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestID);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
            IOU.setMoneyRequestReceipt({});
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (props.report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(props.iou.participants) || shouldReset) {
                const currentUserAccountID = props.currentUserPersonalDetails.accountID;
                const participants = ReportUtils.isPolicyExpenseChat(props.report)
                    ? [{reportID: props.report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(props.report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(participants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType.current));
    };

    const takePhoto = () => {
        camera.current
            .takePhoto({
                qualityPrioritization: 'speed',
                flash: 'on',
            })
            .then((photo) => {
                console.log(photo);
                IOU.setMoneyRequestReceipt(photo);
                navigateToNextPage();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    if (device == null) {
        return (
            <View>
                <Text style={[styles.textHero, styles.textWhite]}>Loading Camera..</Text>
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <Camera
                ref={camera}
                style={{flex: 1, overflow: 'hidden', padding: 10, borderRadius: 16, borderStyle: 'solid', borderWidth: 8, borderColor: Colors.greenAppBackground}}
                device={device}
                isActive
                photo
            />
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    style={[styles.alignItemsStart]}
                    onPress={() => console.log('Gallery')}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Gallery}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    style={[styles.alignItemsCenter]}
                    onPress={() => takePhoto()}
                >
                    <Shutter
                        width={90}
                        height={90}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    style={[styles.alignItemsEnd]}
                    onPress={() => console.log('Flash')}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={Expensicons.Flash}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

// ReceiptSelector.defaultProps = defaultProps;
// ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    // credentials: {key: ONYXKEYS.CREDENTIALS},
    // session: {key: ONYXKEYS.SESSION},
})(ReceiptSelector);
