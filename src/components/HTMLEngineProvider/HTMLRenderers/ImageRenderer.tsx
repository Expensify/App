import React, {memo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {AttachmentContext} from '@components/AttachmentContext';
import {getButtonRole} from '@components/Button/utils';
import {isDeletedNode} from '@components/HTMLEngineProvider/htmlEngineUtils';
import {Document, GalleryNotFound} from '@components/Icon/Expensicons';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFileName, getFileType, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
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
    const isDeleted = isDeletedNode(tnode);

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
    const attachmentSourceAttribute =
        htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] ?? (new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i').test(htmlAttribs.src) ? htmlAttribs.src : null);
    const isAttachmentOrReceipt = !!attachmentSourceAttribute;
    const attachmentID = htmlAttribs[CONST.ATTACHMENT_ID_ATTRIBUTE];

    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    const previewSource = tryResolveUrlFromApiRoot(htmlAttribs.src);
    // The backend always returns these thumbnails with a .jpg extension, even for .png images.
    // As a workaround, we remove the .1024.jpg or .320.jpg suffix only for .png images,
    // For other image formats, we retain the thumbnail as is to avoid unnecessary modifications.
    const processedPreviewSource = typeof previewSource === 'string' ? previewSource.replace(/\.png\.(1024|320)\.jpg$/, '.png') : previewSource;
    const source = tryResolveUrlFromApiRoot(isAttachmentOrReceipt ? attachmentSourceAttribute : htmlAttribs.src);

    const alt = htmlAttribs.alt;
    const imageWidth = (htmlAttribs['data-expensify-width'] && parseInt(htmlAttribs['data-expensify-width'], 10)) || undefined;
    const imageHeight = (htmlAttribs['data-expensify-height'] && parseInt(htmlAttribs['data-expensify-height'], 10)) || undefined;
    const imagePreviewModalDisabled = htmlAttribs['data-expensify-preview-modal-disabled'] === 'true';

    const fileType = getFileType(attachmentSourceAttribute);
    const fallbackIcon = fileType === CONST.ATTACHMENT_FILE_TYPE.FILE ? Document : GalleryNotFound;
    const theme = useTheme();

    let fileName = htmlAttribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || getFileName(`${isAttachmentOrReceipt ? attachmentSourceAttribute : htmlAttribs.src}`);
    const fileInfo = splitExtensionFromFileName(fileName);
    if (!fileInfo.fileExtension) {
        fileName = `${fileInfo?.fileName || CONST.DEFAULT_IMAGE_FILE_NAME}.jpg`;
    }

    const thumbnailImageComponent = (
        <ThumbnailImage
            previewSourceURL={processedPreviewSource}
            style={styles.webViewStyles.tagStyles.img}
            isAuthTokenRequired={isAttachmentOrReceipt}
            fallbackIcon={fallbackIcon}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            isDeleted={isDeleted}
            altText={alt}
            fallbackIconBackground={theme.highlightBG}
            fallbackIconColor={theme.border}
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

                                const attachmentLink = tnode.parent?.attributes?.href;
                                const route = ROUTES.ATTACHMENTS?.getRoute(reportID, attachmentID, type, source, accountID, isAttachmentOrReceipt, fileName, attachmentLink);
                                Navigation.navigate(route);
                            }}
                            onLongPress={(event) => {
                                if (isDisabled) {
                                    return;
                                }
                                showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, isArchivedNonExpenseReport(report, reportNameValuePairs));
                            }}
                            isNested
                            shouldUseHapticsOnLongPress
                            role={getButtonRole(true)}
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
