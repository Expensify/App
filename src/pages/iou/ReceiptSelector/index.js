import {View, Text, PanResponder, PixelRatio} from 'react-native';
import React, {useContext, useRef, useState} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as IOU from '../../../libs/actions/IOU';
import reportPropTypes from '../../reportPropTypes';
import CONST from '../../../CONST';
import ReceiptUpload from '../../../../assets/images/receipt-upload.svg';
import Button from '../../../components/Button';
import styles from '../../../styles/styles';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import ReceiptDropUI from '../ReceiptDropUI';
import AttachmentPicker from '../../../components/AttachmentPicker';
import ConfirmModal from '../../../components/ConfirmModal';
import ONYXKEYS from '../../../ONYXKEYS';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import useLocalize from '../../../hooks/useLocalize';
import {DragAndDropContext} from '../../../components/DragAndDrop/Provider';
import {iouPropTypes, iouDefaultProps} from '../propTypes';
import Navigation from '../../../libs/Navigation/Navigation';
import useReceiptValidation from '../../../hooks/useReceiptValidation';

const propTypes = {
    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),

        /** The current route path */
        path: PropTypes.string,
    }).isRequired,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The id of the transaction we're editing */
    transactionID: PropTypes.string,

    /** Whether or not the receipt selector is in a tab navigator for tab animations */
    // eslint-disable-next-line react/no-unused-prop-types
    isInTabNavigator: PropTypes.bool,
};

const defaultProps = {
    report: {},
    iou: iouDefaultProps,
    transactionID: '',
    isInTabNavigator: true,
};

function ReceiptSelector(props) {
    const iouType = lodashGet(props.route, 'params.iouType', '');
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isDraggingOver} = useContext(DragAndDropContext);
    const {resetValidation, resetValidationErrors, validateReceipt, receiptValidation} = useReceiptValidation();

    /**
     * Sets the Receipt objects and navigates the user to the next page
     * @param {Object} file
     * @param {Object} iou
     * @param {Object} report
     */
    const setReceiptAndNavigate = (file, iou, report) => {
        if (!validateReceipt(file)) {
            return;
        }

        const filePath = URL.createObjectURL(file);
        IOU.setMoneyRequestReceipt(filePath, file.name);

        if (props.transactionID) {
            IOU.replaceReceipt(props.transactionID, file, filePath);
            Navigation.dismissModal();
            return;
        }

        IOU.navigateToNextPage(iou, iouType, report, props.route.path);
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
        }),
    ).current;

    return (
        <View style={[styles.uploadReceiptView(isSmallScreenWidth)]}>
            {!isDraggingOver ? (
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
                    <View
                        style={styles.receiptViewTextContainer}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...panResponder.panHandlers}
                    >
                        <Text style={[styles.textReceiptUpload]}>{translate('receipt.upload')}</Text>
                        <Text style={[styles.subTextReceiptUpload]}>
                            {isSmallScreenWidth ? translate('receipt.chooseReceipt') : translate('receipt.dragReceiptBeforeEmail')}
                            <CopyTextToClipboard
                                text={CONST.EMAIL.RECEIPTS}
                                textStyles={[styles.textBlue]}
                            />
                            {isSmallScreenWidth ? null : translate('receipt.dragReceiptAfterEmail')}
                        </Text>
                    </View>
                    <AttachmentPicker>
                        {({openPicker}) => (
                            <Button
                                medium
                                success
                                text={translate('receipt.chooseFile')}
                                accessibilityLabel={translate('receipt.chooseFile')}
                                style={[styles.p9]}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (file) => {
                                            setReceiptAndNavigate(file, props.iou, props.report);
                                        },
                                    });
                                }}
                            />
                        )}
                    </AttachmentPicker>
                </>
            ) : null}
            <ReceiptDropUI
                onDrop={(e) => {
                    const file = lodashGet(e, ['dataTransfer', 'files', 0]);
                    setReceiptAndNavigate(file, props.iou, props.report);
                }}
                receiptImageTopPosition={receiptImageTopPosition}
            />
            <ConfirmModal
                title={receiptValidation.title ? translate(receiptValidation.title) : ''}
                onConfirm={resetValidation}
                onCancel={resetValidation}
                isVisible={receiptValidation.isReceiptInvalid}
                onModalHide={resetValidationErrors}
                prompt={receiptValidation.reason ? translate(receiptValidation.reason) : ''}
                confirmText={translate('common.close')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

ReceiptSelector.defaultProps = defaultProps;
ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(ReceiptSelector);
