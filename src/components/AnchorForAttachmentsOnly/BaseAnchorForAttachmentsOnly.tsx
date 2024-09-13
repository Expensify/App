import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentView from '@components/Attachments/AttachmentView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as Browser from '@libs/Browser';
import fileDownload from '@libs/fileDownload';
import * as ReportUtils from '@libs/ReportUtils';
import * as Download from '@userActions/Download';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Download as OnyxDownload} from '@src/types/onyx';
import type AnchorForAttachmentsOnlyProps from './types';

type BaseAnchorForAttachmentsOnlyOnyxProps = {
    /** If a file download is happening */
    download: OnyxEntry<OnyxDownload>;
};

type BaseAnchorForAttachmentsOnlyProps = AnchorForAttachmentsOnlyProps &
    BaseAnchorForAttachmentsOnlyOnyxProps & {
        /** Press in handler for the link */
        onPressIn?: () => void;

        /** Press out handler for the link */
        onPressOut?: () => void;
    };

function BaseAnchorForAttachmentsOnly({style, source = '', displayName = '', download, onPressIn, onPressOut}: BaseAnchorForAttachmentsOnlyProps) {
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(source);
    const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];

    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const isDownloading = download?.isDownloading ?? false;

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive, isDisabled}) => (
                <PressableWithoutFeedback
                    style={[style, isOffline && styles.cursorDefault]}
                    onPress={() => {
                        if (isDownloading || isOffline || !sourceID) {
                            return;
                        }
                        Download.setDownload(sourceID, true);
                        fileDownload(sourceURLWithAuth, displayName, '', Browser.isMobileSafari()).then(() => Download.setDownload(sourceID, false));
                    }}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onLongPress={(event) => {
                        if (isDisabled) {
                            return;
                        }
                        showContextMenuForReport(event, anchor, report?.reportID ?? '-1', action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report, reportNameValuePairs));
                    }}
                    shouldUseHapticsOnLongPress
                    accessibilityLabel={displayName}
                    role={CONST.ROLE.BUTTON}
                >
                    <AttachmentView
                        source={sourceURLWithAuth}
                        file={{name: displayName}}
                        shouldShowDownloadIcon={!!sourceID && !isOffline}
                        shouldShowLoadingSpinnerIcon={isDownloading}
                        isUsedAsChatAttachment
                    />
                </PressableWithoutFeedback>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

BaseAnchorForAttachmentsOnly.displayName = 'BaseAnchorForAttachmentsOnly';

export default withOnyx<BaseAnchorForAttachmentsOnlyProps, BaseAnchorForAttachmentsOnlyOnyxProps>({
    download: {
        key: ({source}) => {
            const sourceID = (source?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
            return `${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`;
        },
    },
})(BaseAnchorForAttachmentsOnly);
