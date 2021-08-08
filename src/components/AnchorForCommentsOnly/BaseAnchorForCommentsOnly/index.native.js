import React from 'react';
import {Linking, StyleSheet} from 'react-native';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';
import Text from '../../Text';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../../pages/home/report/ContextMenu/ContextMenuActions';

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = ({
    href,
    children,
    style,
    shouldDownloadFile,
    ...props
}) => {
    let linkRef;
    return (
        <PressableWithSecondaryInteraction
            onSecondaryInteraction={
                (event) => {
                    showContextMenu(
                        CONTEXT_MENU_TYPES.link,
                        event,
                        href,
                        linkRef.current,
                    );
                }
            }
            onPress={() => (shouldDownloadFile ? fileDownload(href) : Linking.openURL(href))}
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
};

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
