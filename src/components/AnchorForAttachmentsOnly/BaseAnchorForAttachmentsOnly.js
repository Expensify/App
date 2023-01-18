import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {
    propTypes as anchorForAttachmentsOnlyPropTypes,
    defaultProps as anchorForAttachmentsOnlyDefaultProps,
} from './anchorForAttachmentsOnlyPropTypes';
import AttachmentView from '../AttachmentView';
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

class BaseAnchorForAttachmentsOnly extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDownloading: false,
        };
        this.processDownload = this.processDownload.bind(this);
    }

    /**
     * Initiate file downloading and update downloading flags
     *
     * @param {String} href
     * @param {String} fileName
     */
    processDownload(href, fileName) {
        this.setState({isDownloading: true});
        fileDownload(href, fileName).then(() => this.setState({isDownloading: false}));
    }

    render() {
        const source = addEncryptedAuthTokenToURL(this.props.source);

        return (
            <ShowContextMenuContext.Consumer>
                {({
                    anchor,
                    reportID,
                    action,
                    checkIfContextMenuActive,
                }) => (
                    <Pressable
                        style={this.props.style}
                        onPress={() => {
                            if (this.state.isDownloading) {
                                return;
                            }
                            this.processDownload(source, this.props.displayName);
                        }}
                        onPressIn={this.props.onPressIn}
                        onPressOut={this.props.onPressOut}
                        onLongPress={event => showContextMenuForReport(
                            event,
                            anchor,
                            reportID,
                            action,
                            checkIfContextMenuActive,
                        )}
                    >
                        <AttachmentView
                            source={source}
                            file={{name: this.props.displayName}}
                            shouldShowDownloadIcon
                            shouldShowLoadingSpinnerIcon={this.state.isDownloading}
                        />
                    </Pressable>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }
}

BaseAnchorForAttachmentsOnly.propTypes = propTypes;
BaseAnchorForAttachmentsOnly.defaultProps = defaultProps;

export default BaseAnchorForAttachmentsOnly;
