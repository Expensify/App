import _ from 'underscore';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import Text from '../../Text';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import AttachmentView from '../../AttachmentView';
import fileDownload from '../../../libs/fileDownload';

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = (props) => {
    let linkRef;
    const rest = _.omit(props, _.keys(propTypes));
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
                    onSecondaryInteraction={
                            (event) => {
                                showContextMenu(
                                    CONTEXT_MENU_TYPES.LINK,
                                    event,
                                    props.href,
                                    lodashGet(linkRef, 'current'),
                                );
                            }
                        }
                >
                    <Text
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
                    </Text>
                </PressableWithSecondaryInteraction>
            )

    );
};

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
