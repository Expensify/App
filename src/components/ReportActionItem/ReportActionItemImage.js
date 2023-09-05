import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Image from '../Image';
import ThumbnailImage from '../ThumbnailImage';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import CONST from '../../CONST';
import PressableWithoutFocus from '../Pressable/PressableWithoutFocus';
import useLocalize from '../../hooks/useLocalize';
import AttachmentModal from '../AttachmentModal';

const propTypes = {
    /** thumbnail URI for the image */
    thumbnail: PropTypes.string,

    /** URI for the image or local numeric reference for the image  */
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** whether or not to enable the image preview modal */
    enablePreviewModal: PropTypes.bool,
};

const defaultProps = {
    thumbnail: null,
    enablePreviewModal: false,
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal}) {
    const {translate} = useLocalize();

    if (thumbnail) {
        const imageSource = tryResolveUrlFromApiRoot(image);
        const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail);
        const thumbnailComponent = (
            <ThumbnailImage
                previewSourceURL={thumbnailSource}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                shouldDynamicallyResize={false}
            />
        );

        if (enablePreviewModal) {
            return (
                <>
                    <AttachmentModal
                        headerTitle={translate('common.receipt')}
                        source={imageSource}
                        isAuthTokenRequired
                        isReceipt
                    >
                        {({show}) => (
                            <PressableWithoutFocus
                                style={[styles.noOutline, styles.w100, styles.h100]}
                                onPress={show}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                            >
                                {thumbnailComponent}
                            </PressableWithoutFocus>
                        )}
                    </AttachmentModal>
                </>
            );
        }
        return thumbnailComponent;
    }

    return (
        <Image
            source={{uri: image}}
            style={[styles.w100, styles.h100]}
        />
    );
}

ReportActionItemImage.propTypes = propTypes;
ReportActionItemImage.defaultProps = defaultProps;
ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
