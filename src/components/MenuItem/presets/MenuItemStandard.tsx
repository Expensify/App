import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemIcon from '@components/MenuItem/leaves/leading/MenuItemIcon';
import MenuItemDescription from '@components/MenuItem/leaves/text/MenuItemDescription';
import MenuItemTitle from '@components/MenuItem/leaves/text/MenuItemTitle';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import type IconAsset from '@src/types/utils/IconAsset';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemStandardProps = {
    /** The title text of the row */
    title: string;

    /** Leading icon to display */
    icon: IconAsset;

    /** Function to fire when the row is pressed */
    onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Whether to show the trailing right arrow (chevron) */
    shouldShowChevron?: boolean;

    /** Supporting description text rendered below the title */
    description?: string;

    /** Should we disable this row? */
    disabled?: boolean;

    /** Label for Sentry tracking */
    sentryLabel?: string;
};

/**
 * The standard MenuItem preset — a tappable navigation row with a leading icon, a title,
 * an optional description below it, and an optional trailing chevron. Covers the most common
 * simple-row shape without exposing the full `Root`/composition surface.
 */
function MenuItemStandard({title, icon, onPress, shouldShowChevron = false, description, disabled = false, sentryLabel}: MenuItemStandardProps) {
    return (
        <MenuItemRoot
            onPress={onPress}
            isDisabled={disabled}
            sentryLabel={sentryLabel}
        >
            <MenuItemRow>
                <MenuItemIcon src={icon} />
                <MenuItemContent>
                    <MenuItemTitle>{title}</MenuItemTitle>
                    {!!description && <MenuItemDescription>{description}</MenuItemDescription>}
                </MenuItemContent>
                {shouldShowChevron && (
                    <MenuItemTrailing>
                        <MenuItemChevron />
                    </MenuItemTrailing>
                )}
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemStandard;
