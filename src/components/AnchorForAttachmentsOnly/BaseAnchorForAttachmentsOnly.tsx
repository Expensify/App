import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentView from '@components/Attachments/AttachmentView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Attachment from '@libs/actions/Attachment';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as Browser from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Download from '@userActions/Download';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type AnchorForAttachmentsOnlyProps from './types';

type BaseAnchorForAttachmentsOnlyProps = AnchorForAttachmentsOnlyProps & {
    /** Press in handler for the link */
    onPressIn?: () => void;

    /** Press out handler for the link */
    onPressOut?: () => void;
};

function BaseAnchorForAttachmentsOnly({style, attachmentID, source = '', displayName = '', onPressIn, onPressOut, isDeleted = false}: BaseAnchorForAttachmentsOnlyProps) {
    const finalSourceURL = isLocalFile(source) ? source : addEncryptedAuthTokenToURL(source);

    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${attachmentID}`);
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const isDownloading = download?.isDownloading ?? false;
    const isAuthTokenRequired = isLocalFile(source) ? false : true;

    const cacheAttachmentFile = () => {
        if (isLocalFile(source) || !attachmentID) {
            return;
        }
        Attachment.cacheAttachment(attachmentID, source);
    };

    useEffect(() => {
        // This is to improve the loading perfomance by caching the remote source
        cacheAttachmentFile();
    }, []);

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive, isDisabled, shouldDisplayContextMenu}) => (
                <PressableWithoutFeedback
                    style={[style, (isOffline || !attachmentID) && styles.cursorDefault]}
                    onPress={() => {
                        if (isDownloading || isOffline || !attachmentID) {
                            return;
                        }
                        Download.setDownload(attachmentID, true);
                        fileDownload(finalSourceURL, displayName, '', Browser.isMobileSafari()).then(() => Download.setDownload(attachmentID, false));
                    }}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onLongPress={(event) => {
                        if (isDisabled || !shouldDisplayContextMenu) {
                            return;
                        }
                        showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedNonExpenseReport(report, reportNameValuePairs));
                    }}
                    shouldUseHapticsOnLongPress
                    accessibilityLabel={displayName}
                    role={CONST.ROLE.BUTTON}
                >
                    <AttachmentView
                        source={source}
                        file={{name: displayName}}
                        isAuthTokenRequired={isAuthTokenRequired}
                        shouldShowDownloadIcon={!!attachmentID && !isOffline}
                        shouldShowLoadingSpinnerIcon={isDownloading}
                        isUsedAsChatAttachment
                        isDeleted={!!isDeleted}
                        isUploading={!attachmentID}
                    />
                </PressableWithoutFeedback>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

BaseAnchorForAttachmentsOnly.displayName = 'BaseAnchorForAttachmentsOnly';

export default BaseAnchorForAttachmentsOnly;
