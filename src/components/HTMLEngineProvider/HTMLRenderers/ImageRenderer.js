import React from 'react';
import {TouchableOpacity} from 'react-native';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Config from '../../../CONFIG';
import AttachmentModal from '../../AttachmentModal';
import styles from '../../../styles/styles';
import ThumbnailImage from '../../ThumbnailImage';

const ImageRenderer = (props) => {
    const htmlAttribs = props.tnode.attributes;

    // There are two kinds of images that need to be displayed:
    //
    //     - Chat Attachment images
    //
    //           Images uploaded by the user via the app or email.
    //           These have a full-sized image `htmlAttribs['data-expensify-source']`
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
    const isAttachment = Boolean(htmlAttribs['data-expensify-source']);
    const originalFileName = htmlAttribs['data-name'];
    let previewSource = htmlAttribs.src;
    let source = isAttachment
        ? htmlAttribs['data-expensify-source']
        : htmlAttribs.src;

    // Update the image URL so the images can be accessed depending on the config environment
    previewSource = previewSource.replace(
        Config.EXPENSIFY.URL_EXPENSIFY_COM,
        Config.EXPENSIFY.URL_API_ROOT,
    );
    source = source.replace(
        Config.EXPENSIFY.URL_EXPENSIFY_COM,
        Config.EXPENSIFY.URL_API_ROOT,
    );

    return (
        <AttachmentModal
            sourceURL={source}
            isAuthTokenRequired={isAttachment}
            originalFileName={originalFileName}
        >
            {({show}) => {
                const openModal = () => {
                    // Blur the list item which got tapped so that it won't get refocused on modal close.
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    show();
                };

                return (
                    <TouchableOpacity
                        style={styles.noOutline}
                        onPress={openModal}
                    >
                        <ThumbnailImage
                            previewSourceURL={previewSource}
                            style={styles.webViewStyles.tagStyles.img}
                            isAuthTokenRequired={isAttachment}
                        />
                    </TouchableOpacity>
                );
            }}
        </AttachmentModal>
    );
};

ImageRenderer.propTypes = htmlRendererPropTypes;
ImageRenderer.displayName = 'ImageRenderer';

export default ImageRenderer;
