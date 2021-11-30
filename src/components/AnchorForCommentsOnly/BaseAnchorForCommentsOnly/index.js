import _ from 'underscore';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import ExpensifyText from '../../ExpensifyText';
import * as anchorForCommentsOnlyPropTypes from '../anchorForCommentsOnlyPropTypes';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import AttachmentView from '../../AttachmentView';
import fileDownload from '../../../libs/fileDownload';

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = (props) => {
    let linkRef;
    // eslint-disable-next-line react/forbid-foreign-prop-types
    const rest = _.omit(props, _.keys(anchorForCommentsOnlyPropTypes.propTypes));
    return (
        props.isAttachment
            ? (
                <Pressable onPress={() => {
                    fileDownload(props.href, props.fileName);
                }}
                >
                    <AttachmentView
                        sourceURL={props.href}
                        file={{name: props.fileName}}
                        shouldShowDownloadIcon
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
                                props.href,
                                lodashGet(linkRef, 'current'),
                            );
                        }
                    }
                >
                    <ExpensifyText
                        ref={el => linkRef = el}
                        style={StyleSheet.flatten(props.style)}
                        accessibilityRole="link"
                        href={props.href}
                        hrefAttrs={{
                            rel: props.rel,
                            target: props.target,
                        }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rest}
                    >
                        {props.children}
                    </ExpensifyText>
                </PressableWithSecondaryInteraction>
            )

    );
};

BaseAnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
BaseAnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
