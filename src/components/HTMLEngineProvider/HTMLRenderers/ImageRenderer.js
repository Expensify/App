import lodashGet from 'lodash/get';
import React, {memo} from 'react';
import {withOnyx} from 'react-native-onyx';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import htmlRendererPropTypes from './htmlRendererPropTypes';

const propTypes = {...htmlRendererPropTypes};

function ImageRenderer(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                        const route = ROUTES.REPORT_ATTACHMENTS.getRoute(report.reportID, source);
                        Navigation.navigate(route);
                    }}
                    onLongPress={(event) =>
                        showContextMenuForReport(
                            // Imitate the web event for native renderers
                            {nativeEvent: {...(event.nativeEvent || {}), target: {tagName: 'IMG'}}},
                            anchor,
                            report.reportID,
                            action,
                            checkIfContextMenuActive,
                            ReportUtils.isArchivedRoom(report),
                        )
                    }
                    role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                    accessibilityLabel={translate('accessibilityHints.viewAttachment')}
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

export default withOnyx({
    user: {
        key: ONYXKEYS.USER,
    },
})(
    memo(
        ImageRenderer,
        (prevProps, nextProps) =>
            lodashGet(prevProps, 'tnode.attributes') === lodashGet(nextProps, 'tnode.attributes') &&
            lodashGet(prevProps, 'user.shouldUseStagingServer') === lodashGet(nextProps, 'user.shouldUseStagingServer'),
    ),
);
