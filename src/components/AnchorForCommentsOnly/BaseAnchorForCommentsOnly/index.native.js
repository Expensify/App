import React from 'react';
import {Linking, StyleSheet} from 'react-native';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';
import Text from '../../Text';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {contextMenuTypes} from '../../../pages/home/report/ContextMenu/ContextMenuActions';

const linkRef = React.createRef();


/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = ({
    href,
    children,
    style,
    shouldDownloadFile,
    ...props
}) => (
    <PressableWithSecondaryInteraction
        onSecondaryInteraction={
            (event) => {
                showContextMenu(
                    contextMenuTypes.link,
                    event,
                    href,
                    linkRef.current,
                );
            }
        }
    >
        <Text
            ref={linkRef}
            style={StyleSheet.flatten(style)}
            onPress={() => (shouldDownloadFile ? fileDownload(href) : Linking.openURL(href))}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </Text>
    </PressableWithSecondaryInteraction>
);

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
