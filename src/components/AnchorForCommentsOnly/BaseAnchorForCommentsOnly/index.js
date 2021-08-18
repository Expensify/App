import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import lodashGet from 'lodash/get';
import Text from '../../Text';
import Icon from '../../Icon';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../../pages/home/report/ContextMenu/ContextMenuActions';
import {Download} from '../../Icon/Expensicons';
import AttachmentView from '../../AttachmentView';
import fileDownload from '../../../libs/fileDownload';


/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = ({
    href,
    rel,
    target,
    children,
    style,
    text,
    ...props
}) => {
    let linkRef;
    return (

        props.shouldDownloadFile
            ? (
                <Pressable onPress={() => {
                    fileDownload(href);
                }}
                >
                    <AttachmentView
                        sourceURL={href}
                        file={{name: text}}
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
                >
                    <Text
                        ref={el => linkRef = el}
                        style={StyleSheet.flatten(style)}
                        accessibilityRole="link"
                        href={href}
                        hrefAttrs={{rel, target}}
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
