import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import AttachmentView from '@components/Attachments/AttachmentView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import * as ReportUtils from '@libs/ReportUtils';
import * as Download from '@userActions/Download';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Download as OnyxDownload} from '@src/types/onyx';
import AnchorForAttachmentsOnlyProps from './AnchorForAttachmentsOnlyTypes';

type BaseAnchorForAttachmentsOnlyPropsWithOnyx = {
    /** If a file download is happening */
    download: OnyxEntry<OnyxDownload>;
};

type BaseAnchorForAttachmentsOnlyProps = AnchorForAttachmentsOnlyProps &
    BaseAnchorForAttachmentsOnlyPropsWithOnyx & {
        /** Press in handler for the link */
        onPressIn?: () => void;
        /** Press out handler for the link */
        onPressOut?: () => void;
    };

function BaseAnchorForAttachmentsOnly({style, source, displayName, download, onPressIn, onPressOut}: BaseAnchorForAttachmentsOnlyProps) {
    const sourceURL = source;
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL);
    const sourceID = (sourceURL.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
    const fileName = displayName;

    const isDownloading = download?.isDownloading ?? false;

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, action, checkIfContextMenuActive}) => (
                <PressableWithoutFeedback
                    style={style}
                    onPress={() => {
                        if (isDownloading) {
                            return;
                        }
                        Download.setDownload(sourceID, true);
                        fileDownload(sourceURLWithAuth, fileName).then(() => Download.setDownload(sourceID, false));
                    }}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    // @ts-expect-error TODO: Remove this once ShowContextMenuContext (https://github.com/Expensify/App/issues/24980) is migrated to TypeScript.
                    onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                    accessibilityLabel={fileName}
                    role={CONST.ROLE.BUTTON}
                >
                    <AttachmentView
                        // @ts-expect-error TODO: Remove this once AttachmentView (https://github.com/Expensify/App/issues/25150) is migrated to TypeScript.
                        source={sourceURLWithAuth}
                        file={{name: fileName}}
                        shouldShowDownloadIcon
                        shouldShowLoadingSpinnerIcon={isDownloading}
                    />
                </PressableWithoutFeedback>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

BaseAnchorForAttachmentsOnly.displayName = 'BaseAnchorForAttachmentsOnly';

export default withOnyx<BaseAnchorForAttachmentsOnlyProps, BaseAnchorForAttachmentsOnlyPropsWithOnyx>({
    download: {
        key: ({source}) => {
            const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
            return `${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`;
        },
    },
})(BaseAnchorForAttachmentsOnly);
