import _ from 'underscore';
import React from 'react';
import lodashGet from 'lodash/get';
import {Linking, StyleSheet, Pressable} from 'react-native';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';
import ExpensifyText from '../../ExpensifyText';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import AttachmentView from '../../AttachmentView';
import styles from '../../../styles/styles';

/*
 * This is a default anchor component for regular links.
 */
class BaseAnchorForCommentsOnly extends React.Component {
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
        let linkRef;
        const rest = _.omit(this.props, _.keys(propTypes));
        return (
            this.props.isAttachment
                ? (
                    <Pressable
                        style={styles.mw100}
                        onPress={() => {
                            if (this.state.isDownloading) {
                                return;
                            }
                            this.processDownload(this.props.href, this.props.fileName);
                        }}
                    >
                        <AttachmentView
                            sourceURL={this.props.href}
                            file={{name: this.props.fileName}}
                            shouldShowDownloadIcon
                            shouldShowLoadingSpinnerIcon={this.state.isDownloading}
                        />
                    </Pressable>
                )
                : (
                    <PressableWithSecondaryInteraction
                        inline
                        onSecondaryInteraction={
                        (event) => {
                            ReportActionContextMenu.showContextMenu(
                                ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
                                event,
                                this.props.href,
                                lodashGet(linkRef, 'current'),
                            );
                        }
                    }
                        onPress={() => Linking.openURL(this.props.href)}
                    >
                        <ExpensifyText
                            ref={el => linkRef = el}
                            style={StyleSheet.flatten(this.props.style)}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                        >
                            {this.props.children}
                        </ExpensifyText>
                    </PressableWithSecondaryInteraction>
                )
        );
    }
}

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
