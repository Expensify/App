import React, {memo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {AttachmentContext} from '@components/AttachmentContext';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
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
    const attachmentSourceAttribute = htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
    const isAttachmentOrReceipt = !!attachmentSourceAttribute;

    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    const previewSource = tryResolveUrlFromApiRoot(htmlAttribs.src);
    const source = tryResolveUrlFromApiRoot(isAttachmentOrReceipt ? attachmentSourceAttribute : htmlAttribs.src);

    const alt = htmlAttribs.alt;
    const imageWidth = (htmlAttribs['data-expensify-width'] && parseInt(htmlAttribs['data-expensify-width'], 10)) || undefined;
    const imageHeight = (htmlAttribs['data-expensify-height'] && parseInt(htmlAttribs['data-expensify-height'], 10)) || undefined;
    const imagePreviewModalDisabled = htmlAttribs['data-expensify-preview-modal-disabled'] === 'true';

    const fileType = FileUtils.getFileType(attachmentSourceAttribute);
    const fallbackIcon = fileType === CONST.ATTACHMENT_FILE_TYPE.FILE ? Expensicons.Document : Expensicons.Gallery;
    const thumbnailImageComponent = (
        <ThumbnailImage
            previewSourceURL={previewSource}
            style={styles.webViewStyles.tagStyles.img}
            isAuthTokenRequired={isAttachmentOrReceipt}
            fallbackIcon={fallbackIcon}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            altText={alt}
        />
    );

    return imagePreviewModalDisabled ? (
        thumbnailImageComponent
    ) : (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive, isDisabled}) => (
                <AttachmentContext.Consumer>
                    {({reportID, accountID, type}) => (
                        <PressableWithoutFocus
                            style={[styles.noOutline]}
                            onPress={() => {
                                if (!source || !type) {
                                    return;
                                }

                                const route = ROUTES.ATTACHMENTS?.getRoute(reportID ?? '-1', type, source, accountID, isAttachmentOrReceipt);
                                Navigation.navigate(route);
                            }}
                            onLongPress={(event) => {
                                if (isDisabled) {
                                    return;
                                }
                                showContextMenuForReport(event, anchor, report?.reportID ?? '-1', action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report, reportNameValuePairs));
                            }}
                            shouldUseHapticsOnLongPress
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        >
                            {thumbnailImageComponent}
                        </PressableWithoutFocus>
                    )}
                </AttachmentContext.Consumer>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

ImageRenderer.displayName = 'ImageRenderer';

const ImageRendererMemorize = memo(
    ImageRenderer,
    (prevProps, nextProps) => prevProps.tnode.attributes === nextProps.tnode.attributes && prevProps.user?.shouldUseStagingServer === nextProps.user?.shouldUseStagingServer,
);

function ImageRendererWrapper(props: CustomRendererProps<TBlock>) {
    const [user] = useOnyx(ONYXKEYS.USER);
    return (
        <ImageRendererMemorize
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            user={user}
        />
    );
}

export default ImageRendererWrapper;
