import React from 'react';
import {StyleSheet} from 'react-native';
import Text from '../../Text';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import PressableWithSecondaryInteraction from '../../PressableWithSecondaryInteraction';
import {showContextMenu} from '../../../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../../pages/home/report/ContextMenu/ContextMenuActions';


/*
* This is a default anchor component for regular links.
*/
const BaseAnchorForCommentsOnly = ({
    href,
    rel,
    target,
    children,
    style,
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
    );
};

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
