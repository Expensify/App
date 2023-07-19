import {View, Text, PixelRatio} from 'react-native';
import React, {useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as IOU from '../../../libs/actions/IOU';
import reportPropTypes from '../../reportPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import CONST from '../../../CONST';
import {withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ReceiptUpload from '../../../../assets/images/receipt-upload.svg';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import Button from '../../../components/Button';
import styles from '../../../styles/styles';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import ReceiptDropUI from '../ReceiptDropUI';
import AttachmentPicker from '../../../components/AttachmentPicker';
import NavigateToNextIOUPage from '../NavigateToNextIOUPage';

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

    /** Current user personal details */
    currentUserPersonalDetails: personalDetailsPropType,

    /** Used by drag and drop to determine if we have a file dragged over the view */
    isDraggingOver: PropTypes.bool,
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
    isDraggingOver: false,
};

function ReceiptSelector(props) {
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);

    const defaultView = () => (
        <>
            <View
                onLayout={({nativeEvent}) => {
                    setReceiptImageTopPosition(PixelRatio.roundToNearestPixel(nativeEvent.layout.top));
                }}
            >
                <ReceiptUpload
                    width={CONST.RECEIPT.ICON_SIZE}
                    height={CONST.RECEIPT.ICON_SIZE}
                />
            </View>
            <Text style={[styles.textReceiptUpload]}>Upload receipt</Text>
            <Text style={[styles.subTextReceiptUpload]}>
                Drag a receipt onto this page, forward a receipt to{' '}
                <View style={{flexDirection: 'row'}}>
                    <CopyTextToClipboard
                        text="receipts@expensify.com"
                        textStyles={[styles.textBlue]}
                    />
                </View>{' '}
                or choose a file to upload below.
            </Text>
            <AttachmentPicker>
                {({openPicker}) => (
                    <PressableWithFeedback accessibilityRole="button">
                        <Button
                            medium
                            success
                            text="Choose File"
                            accessibilityLabel="Choose File"
                            style={[styles.buttonReceiptUpload]}
                            onPress={() => {
                                openPicker({
                                    onPicked: (file) => {
                                        const filePath = URL.createObjectURL(file);
                                        IOU.setMoneyRequestReceipt(filePath);
                                        NavigateToNextIOUPage(props.iou, iouType, reportID, props.report, props.currentUserPersonalDetails);
                                    },
                                });
                            }}
                        />
                    </PressableWithFeedback>
                )}
            </AttachmentPicker>
        </>
    );

    // TODO: Add strings correctly with translate
    return (
        <View style={[styles.uploadReceiptView]}>
            {!props.isDraggingOver ? defaultView() : null}
            {props.isDraggingOver && <ReceiptDropUI receiptImageTopPosition={receiptImageTopPosition} />}
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default ReceiptSelector;
