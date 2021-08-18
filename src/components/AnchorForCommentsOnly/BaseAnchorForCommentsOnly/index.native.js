import React from 'react';
import lodashGet from 'lodash/get';
import {Linking, StyleSheet, Pressable} from 'react-native';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';
import Text from '../../Text';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import Icon from '../../Icon';
import {Download} from '../../Icon/Expensicons';
import AttachmentView from '../../AttachmentView';

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = ({
    href,
    children,
    style,
    isAttachment,
    fileName,
    ...props
}) => {
    let linkRef;
    return (
        isAttachment
            ? (
                <Pressable onPress={() => {
                    fileDownload(href);
                }}
                >
                    <AttachmentView
                        sourceURL={href}
                        file={{name: fileName}}
                        rightElement={(
                            <Icon src={Download} />
                        )}
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
                        href,
                        lodashGet(linkRef, 'current'),
                    );
                }
            }
                    onPress={() => Linking.openURL(href)}
                >
                    <Text
                        ref={el => linkRef = el}
                        style={StyleSheet.flatten(style)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    >
                        {children}
                    </Text>
                </PressableWithSecondaryInteraction>
            )
    );
};

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
