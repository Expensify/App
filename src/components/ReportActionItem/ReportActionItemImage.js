import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import EReceiptThumbnail from '@components/EReceiptThumbnail';
import Image from '@components/Image';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** thumbnail URI for the image */
    thumbnail: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** URI for the image or local numeric reference for the image  */
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** whether or not to enable the image preview modal */
    enablePreviewModal: PropTypes.bool,

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction: transactionPropTypes,

    /** whether thumbnail is refer the local file or not */
    isLocalFile: PropTypes.bool,
};

const defaultProps = {
    thumbnail: null,
    transaction: {},
    enablePreviewModal: false,
    isLocalFile: false,
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal, transaction, isLocalFile}) {
    const {translate} = useLocalize();
    const imageSource = tryResolveUrlFromApiRoot(image || '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const isEReceipt = !_.isEmpty(transaction) && TransactionUtils.hasEReceipt(transaction);
    const styles = useThemeStyles();

    let receiptImageComponent;

    if (isEReceipt) {
        receiptImageComponent = (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail transactionID={transaction.transactionID} />
            </View>
        );
    } else if (thumbnail && !isLocalFile) {
        receiptImageComponent = (
            <ThumbnailImage
                previewSourceURL={thumbnailSource}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                shouldDynamicallyResize={false}
            />
        );
    } else {
        receiptImageComponent = (
            <Image
                source={{uri: thumbnail || image}}
                style={[styles.w100, styles.h100]}
            />
        );
    }

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report}) => (
                    <AttachmentModal
                        headerTitle="Receipt"
                        source={imageSource}
                        isAuthTokenRequired={!isLocalFile}
                        report={report}
                        isReceiptAttachment
                        allowToDownload
                    >
                        {({show}) => (
                            <PressableWithoutFocus
                                style={[styles.noOutline, styles.w100, styles.h100]}
                                onPress={show}
                                role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                            >
                                {receiptImageComponent}
                            </PressableWithoutFocus>
                        )}
                    </AttachmentModal>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return receiptImageComponent;
}

ReportActionItemImage.propTypes = propTypes;
ReportActionItemImage.defaultProps = defaultProps;
ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
