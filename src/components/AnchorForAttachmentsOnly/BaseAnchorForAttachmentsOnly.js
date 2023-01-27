import React from 'react';
import {Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {
    propTypes as anchorForAttachmentsOnlyPropTypes,
    defaultProps as anchorForAttachmentsOnlyDefaultProps,
} from './anchorForAttachmentsOnlyPropTypes';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import AttachmentView from '../AttachmentView';
import * as Download from '../../libs/actions/Download';
import fileDownload from '../../libs/fileDownload';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';
import {ShowContextMenuContext, showContextMenuForReport} from '../ShowContextMenuContext';

const propTypes = {
    /** Press in handler for the link */
    onPressIn: PropTypes.func,

    /** Press out handler for the link */
    onPressOut: PropTypes.func,

    ...anchorForAttachmentsOnlyPropTypes,
};

const defaultProps = {
    onPressIn: undefined,
    onPressOut: undefined,
    ...anchorForAttachmentsOnlyDefaultProps,
};

const BaseAnchorForAttachmentsOnly = (props) => {
    const sourceURL = props.source;
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(sourceURL);
    const sourceID = (sourceURL.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
    const fileName = props.displayName;

    const isDownloading = props.download && props.download.isDownloading;

    return (
        <ShowContextMenuContext.Consumer>
            {({
                anchor,
                reportID,
                action,
                checkIfContextMenuActive,
            }) => (
                <Pressable
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
                    onLongPress={event => showContextMenuForReport(
                        event,
                        anchor,
                        reportID,
                        action,
                        checkIfContextMenuActive,
                    )}
                >
                    <AttachmentView
                        source={sourceURLWithAuth}
                        file={{name: fileName}}
                        shouldShowDownloadIcon
                        shouldShowLoadingSpinnerIcon={isDownloading}
                    />
                </Pressable>
            )}
        </ShowContextMenuContext.Consumer>
    );
};

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
