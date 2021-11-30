import _ from 'underscore';
import React from 'react';
import lodashGet from 'lodash/get';
import {Linking, StyleSheet, Pressable} from 'react-native';
import * as anchorForCommentsOnlyPropTypes from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';
import Text from '../../Text';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import * as ReportActionContextMenu from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import AttachmentView from '../../AttachmentView';
import styles from '../../../styles/styles';

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
                <Pressable
                    style={styles.mw100}
                    onPress={() => {
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
                    onPress={() => Linking.openURL(props.href)}
                >
                    <Text
                        ref={el => linkRef = el}
                        style={StyleSheet.flatten(props.style)}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rest}
                    >
                        {props.children}
                    </Text>
                </PressableWithSecondaryInteraction>
            )
    );
};

BaseAnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
BaseAnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
