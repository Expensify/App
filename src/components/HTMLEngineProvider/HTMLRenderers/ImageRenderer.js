import React from 'react';
import _ from 'underscore';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Config from '../../../CONFIG';
import AttachmentModal from '../../AttachmentModal';
import styles from '../../../styles/styles';
import ThumbnailImage from '../../ThumbnailImage';
import PressableWithoutFocus from '../../PressableWithoutFocus';
import CONST from '../../../CONST';
import {ShowContextMenuContext, showContextMenuForReport} from '../../ShowContextMenuContext';

/**
 * Update the image URL so images can be accessed depending on the config environment
 *
 * @param {String} urlString
 * @returns {*|String}
 */
function mapSource(urlString) {
    // Attachments can come from either staging or prod, depending on the env they were uploaded by
    // Both should be replaced and loaded from API ROOT of the current environment
    const originsWeShouldReplace = [Config.EXPENSIFY.EXPENSIFY_URL, Config.EXPENSIFY.STAGING_EXPENSIFY_URL];

    const originToReplace = _.find(originsWeShouldReplace, origin => urlString.startsWith(origin));
    if (!originToReplace) {
        return urlString;
    }

    return urlString.replace(
        originToReplace,
        Config.EXPENSIFY.URL_API_ROOT,
    );
}

const ImageRenderer = (props) => {
    const htmlAttribs = props.tnode.attributes;

    // There are two kinds of images that need to be displayed:
    //
    //     - Chat Attachment images
    //
    //           Images uploaded by the user via the app or email.
    //           These have a full-sized image `htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]`
    //           and a thumbnail `htmlAttribs.src`. Both of these URLs need to have
    //           an authToken added to them in order to control who
    //           can see the images.
    //
    //     - Non-Attachment Images
    //
    //           These could be hosted from anywhere (Expensify or another source)
    //           and are not protected by any kind of access control e.g. certain
    //           Concierge responder attachments are uploaded to S3 without any access
    //           control and thus require no authToken to verify access.
    //
    const isAttachment = Boolean(htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);
    const originalFileName = htmlAttribs['data-name'];
    const previewSource = mapSource(htmlAttribs.src);
    const source = mapSource(isAttachment
        ? htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]
        : htmlAttribs.src);

    const imageWidth = htmlAttribs['data-expensify-width'] ? parseInt(htmlAttribs['data-expensify-width'], 10) : undefined;
    const imageHeight = htmlAttribs['data-expensify-height'] ? parseInt(htmlAttribs['data-expensify-height'], 10) : undefined;
    const imagePreviewModalDisabled = htmlAttribs['data-expensify-preview-modal-disabled'] === 'true';

    return imagePreviewModalDisabled ? (
        <ThumbnailImage
            previewSourceURL={previewSource}
            style={styles.webViewStyles.tagStyles.img}
            isAuthTokenRequired={isAttachment}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
        />
    ) : (
        <ShowContextMenuContext.Consumer>
            {({
                anchor,
                reportID,
                action,
                checkIfContextMenuActive,
            }) => (
                <AttachmentModal
                    allowDownload
                    sourceURL={source}
                    isAuthTokenRequired={isAttachment}
                    originalFileName={originalFileName}
                >
                    {({show}) => (
                        <PressableWithoutFocus
                            style={styles.noOutline}
                            onPress={show}
                            onLongPress={event => showContextMenuForReport(event, anchor, reportID, action, checkIfContextMenuActive)}
                        >
                            <ThumbnailImage
                                previewSourceURL={previewSource}
                                style={styles.webViewStyles.tagStyles.img}
                                isAuthTokenRequired={isAttachment}
                                imageWidth={imageWidth}
                                imageHeight={imageHeight}
                            />
                        </PressableWithoutFocus>
                    )}
                </AttachmentModal>
            )}
        </ShowContextMenuContext.Consumer>
    );
};

ImageRenderer.propTypes = htmlRendererPropTypes;
ImageRenderer.displayName = 'ImageRenderer';

export default ImageRenderer;
