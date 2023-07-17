import {View, Text} from 'react-native';
import React, {useRef, useState} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as IOU from '../../../libs/actions/IOU';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as ReportUtils from '../../../libs/ReportUtils';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import CONST from '../../../CONST';
import {withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import Styles from '../../../styles/styles';
import ReceiptUpload from '../../../../assets/images/receipt-upload.svg';
import {PressableWithFeedback} from '../../../components/Pressable';
import Button from '../../../components/Button';
import styles from '../../../styles/styles';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import DragAndDrop from '../../../components/DragAndDrop';
import ReportDropUI from '../../home/report/ReportDropUI';
import Colors from '../../../styles/colors';
import ReceiptDropUI from '../ReceiptDropUI';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),

    /**
     * Current user personal details
     */
    currentUserPersonalDetails: personalDetailsPropType,
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function ReceiptSelector(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));

    const [isDraggingOver, setIsDraggingOver] = useState(false);

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

    // TODO: Add strings correctly with translate
    return (
        <DragAndDrop
            dropZoneId={CONST.RECEIPT.DROP_NATIVE_ID}
            activeDropZoneId={CONST.RECEIPT.ACTIVE_DROP_NATIVE_ID}
            onDragEnter={() => {
                setIsDraggingOver(true);
                console.log('Receipt selector drag enter');
            }}
            onDragLeave={() => {
                setIsDraggingOver(false);
                console.log('Receipt selector drag leave');
            }}
            onDrop={(e) => {
                // TODO
            }}
        >
            <View
                nativeID={CONST.RECEIPT.DROP_NATIVE_ID}
                style={[Styles.flex1, Styles.uploadReceiptBorder, Styles.justifyContentCenter, Styles.alignItemsCenter, Styles.p10, Styles.m5, Styles.gap1]}
            >
                <ReceiptUpload
                    width={164}
                    height={164}
                />
                <Text style={[Styles.textReceiptUpload]}>{isDraggingOver ? 'Let it go' : 'Upload receipt'}</Text>
                {isDraggingOver ? (
                    <Text style={[Styles.subTextReceiptUpload]}>Drop your file here</Text>
                ) : (
                    <Text style={[Styles.subTextReceiptUpload]}>
                        Drag a receipt onto this page, forward a receipt to{' '}
                        <CopyTextToClipboard
                            text="receipts@expensify.com"
                            textStyles={[styles.textBlue]}
                        />{' '}
                        or choose a file to upload below.
                    </Text>
                )}
                {!isDraggingOver && (
                    <PressableWithFeedback accessibilityRole="button">
                        <Button
                            medium
                            success
                            text="Choose File"
                            style={[Styles.buttonReceiptUpload]}
                            onPress={() => console.log(`Clicked`)}
                        />
                    </PressableWithFeedback>
                )}
                {isDraggingOver && <ReceiptDropUI />}
            </View>
        </DragAndDrop>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default ReceiptSelector;
