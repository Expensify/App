import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import Image from '../Image';
import ThumbnailImage from '../ThumbnailImage';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import {ShowContextMenuContext} from '../ShowContextMenuContext';
import Navigation from '../../libs/Navigation/Navigation';
import PressableWithoutFocus from '../Pressable/PressableWithoutFocus';
import useLocalize from '../../hooks/useLocalize';
import EReceiptThumbnail from '../EReceiptThumbnail';
import transactionPropTypes from '../transactionPropTypes';
import * as TransactionUtils from '../../libs/TransactionUtils';

const propTypes = {
    /** thumbnail URI for the image */
    thumbnail: PropTypes.string,

    /** URI for the image or local numeric reference for the image  */
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** whether or not to enable the image preview modal */
    enablePreviewModal: PropTypes.bool,

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction: transactionPropTypes,
};

const defaultProps = {
    thumbnail: null,
    transaction: {},
    enablePreviewModal: false,
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal, transaction}) {
    const {translate} = useLocalize();
    const imageSource = tryResolveUrlFromApiRoot(image || '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const isEReceipt = !_.isEmpty(transaction) && TransactionUtils.hasEReceipt(transaction);

    let receiptImageComponent;

    if (isEReceipt) {
        receiptImageComponent = (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail transactionID={transaction.transactionID} />
            </View>
        );
    } else if (thumbnail) {
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
                source={{uri: image}}
                style={[styles.w100, styles.h100]}
            />
        );
    }

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report}) => (
                    <PressableWithoutFocus
                        style={[styles.noOutline, styles.w100, styles.h100]}
                        onPress={() => {
                            const route = ROUTES.REPORT_ATTACHMENTS.getRoute(report.reportID, imageSource);
                            Navigation.navigate(route);
                        }}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                    >
                        {receiptImageComponent}
                    </PressableWithoutFocus>
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
