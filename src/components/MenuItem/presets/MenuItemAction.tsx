import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemLeading from '@components/MenuItem/layout/MenuItemLeading';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTitle from '@components/MenuItem/leaves/content/MenuItemTitle';
import MenuItemIcon from '@components/MenuItem/leaves/leading/MenuItemIcon';

import useOnyx from '@hooks/useOnyx';

import {callIfAuthenticated, getLinkRouteIfAuthenticated} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {GestureResponderEvent} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type MenuItemActionProps = WithRequiredSentryLabel &
    WithTestID & {
        /** The title text of the row */
        title: string;

        /** Leading icon to display */
        icon: IconAsset;

        /** Function to fire when the row is pressed */
        onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Renders the row as a link to this route on web, so it can be opened in a new tab */
        linkRoute?: Route;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/**
 * The action MenuItem preset — a tappable row with a leading icon and a title that performs an
 * action in place (delete, select, add, etc.)
 */
function MenuItemAction({title, icon, onPress, linkRoute, isDisabled = false, sentryLabel, testID}: MenuItemActionProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    return (
        <MenuItemRoot
            onPress={callIfAuthenticated(onPress, session)}
            linkRoute={getLinkRouteIfAuthenticated(linkRoute, session)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
            accessibilityLabel={title}
        >
            <MenuItemRow>
                <MenuItemLeading>
                    <MenuItemIcon src={icon} />
                </MenuItemLeading>
                <MenuItemContent>
                    <MenuItemTitle>{title}</MenuItemTitle>
                </MenuItemContent>
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemAction;
