import React, {memo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {User} from '@src/types/onyx';

type ImageRendererWithOnyxProps = {
    /** Current user */
    // Following line is disabled because the onyx prop is only being used on the memo HOC
    // eslint-disable-next-line react/no-unused-prop-types
    user: OnyxEntry<User>;
};

type ImageRendererProps = ImageRendererWithOnyxProps & CustomRendererProps<TBlock>;

function ImageRenderer({tnode}: ImageRendererProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const htmlAttribs = tnode.attributes;

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

    const imageWidth = (htmlAttribs['data-expensify-width'] && parseInt(htmlAttribs['data-expensify-width'], 10)) || undefined;
    const imageHeight = (htmlAttribs['data-expensify-height'] && parseInt(htmlAttribs['data-expensify-height'], 10)) || undefined;
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
                        const route = ROUTES.REPORT_ATTACHMENTS.getRoute(report?.reportID ?? '', source);
                        Navigation.navigate(route);
                    }}
                    onLongPress={(event) => showContextMenuForReport(event, anchor, report?.reportID ?? '', action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
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

ImageRenderer.displayName = 'ImageRenderer';

export default withOnyx<ImageRendererProps, ImageRendererWithOnyxProps>({
    user: {
        key: ONYXKEYS.USER,
    },
})(
    memo(
        ImageRenderer,
        (prevProps, nextProps) => prevProps.tnode.attributes === nextProps.tnode.attributes && prevProps.user?.shouldUseStagingServer === nextProps.user?.shouldUseStagingServer,
    ),
);
