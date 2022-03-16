import _ from 'underscore';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import Text from '../../Text';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import AttachmentView from '../../AttachmentView';
import fileDownload from '../../../libs/fileDownload';
import Str from 'expensify-common/lib/str';

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
                    <Pressable onPress={() => {
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
                                Str.isValidEmail(this.props.fileName) ? ContextMenuActions.CONTEXT_MENU_TYPES.EMAIL : ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
                                event,
                                this.props.href,
                                lodashGet(linkRef, 'current'),
                            );
                        }
                    }
                    >
                        <Text
                            ref={el => linkRef = el}
                            style={StyleSheet.flatten(this.props.style)}
                            accessibilityRole="link"
                            href={this.props.href}
                            hrefAttrs={{
                                rel: this.props.rel,
                                target: this.props.target,
                            }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                        >
                            {this.props.children}
                        </Text>
                    </PressableWithSecondaryInteraction>
                )
        );
    }
}

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
