import React from 'react';
import AttachmentView from '@components/Attachments/AttachmentView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import {setDownload} from '@userActions/Download';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type AnchorForAttachmentsOnlyProps from './types';

type BaseAnchorForAttachmentsOnlyProps = AnchorForAttachmentsOnlyProps & {
    /** Press in handler for the link */
    onPressIn?: () => void;

    /** Press out handler for the link */
    onPressOut?: () => void;
};

function BaseAnchorForAttachmentsOnly({style, source = '', displayName = '', onPressIn, onPressOut, isDeleted}: BaseAnchorForAttachmentsOnlyProps) {
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(source);
    const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];

    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {canBeMissing: true});
    const {translate} = useLocalize();

    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const isDownloading = download?.isDownloading ?? false;

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, isReportArchived, action, checkIfContextMenuActive, isDisabled, shouldDisplayContextMenu}) => (
                <PressableWithoutFeedback
                    style={[style, (isOffline || !sourceID) && styles.cursorDefault]}
                    onPress={() => {
                        if (isDownloading || isOffline || !sourceID) {
                            return;
                        }
                        setDownload(sourceID, true);
                        fileDownload(translate, sourceURLWithAuth, displayName, '', isMobileSafari()).then(() => setDownload(sourceID, false));
                    }}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onLongPress={(event) => {
                        if (isDisabled || !shouldDisplayContextMenu) {
                            return;
                        }
                        showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, isArchivedNonExpenseReport(report, isReportArchived));
                    }}
                    shouldUseHapticsOnLongPress
                    accessibilityLabel={displayName}
                    role={CONST.ROLE.BUTTON}
                >
                    <AttachmentView
                        source={source}
                        file={{name: displayName}}
                        shouldShowDownloadIcon={!!sourceID && !isOffline}
                        shouldShowLoadingSpinnerIcon={isDownloading}
                        isUsedAsChatAttachment
                        isDeleted={!!isDeleted}
                        isUploading={!sourceID}
                        isAuthTokenRequired={!!sourceID}
                        isUploaded={!isEmptyObject(report)}
                    />
                </PressableWithoutFeedback>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

export default BaseAnchorForAttachmentsOnly;
