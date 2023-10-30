import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import AttachmentView from '@components/Attachments/AttachmentView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import * as ReportUtils from '@libs/ReportUtils';
import * as Download from '@userActions/Download';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps as anchorForAttachmentsOnlyDefaultProps, propTypes as anchorForAttachmentsOnlyPropTypes} from './anchorForAttachmentsOnlyPropTypes';

const propTypes = {
    /** Press in handler for the link */
    onPressIn: PropTypes.func,

    /** Press out handler for the link */
    onPressOut: PropTypes.func,

    /** If a file download is happening */
    download: PropTypes.shape({
        isDownloading: PropTypes.bool.isRequired,
    }),

    ...anchorForAttachmentsOnlyPropTypes,
};

const defaultProps = {
    onPressIn: undefined,
    onPressOut: undefined,
    download: {isDownloading: false},
    ...anchorForAttachmentsOnlyDefaultProps,
};

function BaseAnchorForAttachmentsOnly(props) {
    const sourceURL = props.source;
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL);
    const sourceID = (sourceURL.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
    const fileName = props.displayName;

    const isDownloading = props.download && props.download.isDownloading;

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, action, checkIfContextMenuActive}) => (
                <PressableWithoutFeedback
                    style={props.style}
                    onPress={() => {
                        if (isDownloading) {
                            return;
                        }
                        Download.setDownload(sourceID, true);
                        fileDownload(sourceURLWithAuth, fileName).then(() => Download.setDownload(sourceID, false));
                    }}
                    onPressIn={props.onPressIn}
                    onPressOut={props.onPressOut}
                    onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                    accessibilityLabel={fileName}
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                >
                    <AttachmentView
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
BaseAnchorForAttachmentsOnly.propTypes = propTypes;
BaseAnchorForAttachmentsOnly.defaultProps = defaultProps;

export default withOnyx({
    download: {
        key: ({source}) => {
            const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
            return `${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`;
        },
    },
})(BaseAnchorForAttachmentsOnly);
