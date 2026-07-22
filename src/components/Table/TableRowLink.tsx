import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import useThemeStyles from '@hooks/useThemeStyles';

import openInternalRouteInNewTab, {getRouteURL} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useContext} from 'react';

import {TableRowActionContext, useIsInTableGrid} from './TableSemantics';

type TableRowLinkProps = ChildrenProps & {
    /** The link's accessible name — the row's primary identifier, such as the member's name */
    accessibilityLabel: string;

    /** Sentry label for the link */
    sentryLabel: string;
};

/**
 * The row's keyboard affordance, placed inside the subject cell. A row in a table takes no focus of its own, so
 * an interactive row must contain one of these or its action cannot be reached from the keyboard.
 */
function TableRowLink({children, accessibilityLabel, sentryLabel}: TableRowLinkProps): React.ReactNode {
    const styles = useThemeStyles();
    const isInTableGrid = useIsInTableGrid();
    const {onPress, isDisabled, route} = useContext(TableRowActionContext);

    if (!isInTableGrid) {
        return children;
    }

    const href = route && !isDisabled ? getRouteURL(route) : undefined;

    return (
        <PressableWithFeedback
            accessibilityLabel={accessibilityLabel}
            role={href ? CONST.ROLE.LINK : CONST.ROLE.BUTTON}
            href={href}
            disabled={isDisabled}
            style={[styles.justifyContentCenter, styles.minHeight6]}
            sentryLabel={sentryLabel}
            onKeyDown={
                href
                    ? (event) => {
                          if (event.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                              return;
                          }

                          event.preventDefault();

                          if (event.metaKey || event.ctrlKey) {
                              window.open(href, '_blank', 'noopener,noreferrer');
                              return;
                          }

                          onPress?.();
                      }
                    : undefined
            }
            onPress={(event) => {
                // The row is pressable for the mouse, so don't fire the press twice.
                event?.stopPropagation?.();

                if (route && openInternalRouteInNewTab(route, event)) {
                    return;
                }

                // Without this the anchor navigates for real, reloading the app instead of routing within it.
                event?.preventDefault?.();
                onPress?.();
            }}
        >
            {children}
        </PressableWithFeedback>
    );
}

TableRowLink.displayName = 'TableRowLink';

export default TableRowLink;
