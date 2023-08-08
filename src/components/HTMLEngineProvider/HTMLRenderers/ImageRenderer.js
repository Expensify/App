import React from 'react';
import Navigation from '../../../libs/Navigation/Navigation';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import styles from '../../../styles/styles';
import ThumbnailImage from '../../ThumbnailImage';
import PressableWithoutFocus from '../../Pressable/PressableWithoutFocus';
import CONST from '../../../CONST';
import {ShowContextMenuContext, showContextMenuForReport} from '../../ShowContextMenuContext';
import tryResolveUrlFromApiRoot from '../../../libs/tryResolveUrlFromApiRoot';
import * as ReportUtils from '../../../libs/ReportUtils';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import ROUTES from '../../../ROUTES';

const propTypes = {...htmlRendererPropTypes, ...withLocalizePropTypes};

function ImageRenderer(props) {
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
    const isAttachmentOrReceipt = Boolean(htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);

    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    const previewSource = tryResolveUrlFromApiRoot(htmlAttribs.src);
    const source = tryResolveUrlFromApiRoot(isAttachmentOrReceipt ? htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] : htmlAttribs.src);

    const imageWidth = htmlAttribs['data-expensify-width'] ? parseInt(htmlAttribs['data-expensify-width'], 10) : undefined;
    const imageHeight = htmlAttribs['data-expensify-height'] ? parseInt(htmlAttribs['data-expensify-height'], 10) : undefined;
    const imagePreviewModalDisabled = htmlAttribs['data-expensify-preview-modal-disabled'] === 'true';

    return imagePreviewModalDisabled ? (
        <ThumbnailImage
            previewSourceURL={previewSource}
            style={styles.webViewStyles.tagStyles.img}
            isAuthTokenRequired={isAttachmentOrReceipt}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
        />
    ) : (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, action, checkIfContextMenuActive}) => (
                <PressableWithoutFocus
                    style={[styles.noOutline]}
                    onPress={() => {
                        const route = ROUTES.getReportAttachmentRoute(report.reportID, source);
                        Navigation.navigate(route);
                    }}
                    onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                    accessibilityLabel={props.translate('accessibilityHints.viewAttachment')}
                >
                    <ThumbnailImage
                        previewSourceURL={previewSource}
                        style={styles.webViewStyles.tagStyles.img}
                        isAuthTokenRequired={isAttachmentOrReceipt}
                        imageWidth={imageWidth}
                        imageHeight={imageHeight}
                    />
                </PressableWithoutFocus>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

ImageRenderer.propTypes = propTypes;
ImageRenderer.displayName = 'ImageRenderer';

export default withLocalize(ImageRenderer);
