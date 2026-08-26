import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useLocalize from '@hooks/useLocalize';

import {sortIconsByName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import lodashSortBy from 'lodash/sortBy';
import React from 'react';

import useAccountIcons from './useAccountIcons';

type SortByValue = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type SortBy =
    | readonly [typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME]
    | readonly [typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.ID]
    | readonly [typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE]
    | readonly [typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME, typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE]
    | readonly [typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.ID, typeof CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE];

type MultiAccountAvatarProps = {
    /** Account IDs to display avatars for. Entries equal to `CONST.DEFAULT_NUMBER_ID` are dropped; when none remain, a single placeholder avatar renders so the slot keeps its size. */
    accountIDs: number[];

    /** Options for the horizontal stack */
    horizontalOptions?: HorizontalStackingOptions;

    /** How to order the avatars before rendering them. Every avatar sits in an equivalent slot, so any order is renderable. Omit to leave them in the order `accountIDs` was passed */
    sortBy?: SortBy;

    /** Emails of invited, not-yet-registered accounts. Also seeds a deterministic fallback avatar for each invited account */
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Whether the avatars are displayed within a report action */
    isInReportAction?: boolean;
};

/** Applies the requested ordering. `undefined` leaves the icons in the order the account IDs were passed. */
function sortIcons(icons: Icon[], sortBy: SortBy | undefined, localeCompare: ReturnType<typeof useLocalize>['localeCompare']) {
    if (!sortBy) {
        return icons;
    }

    const sortKeys: readonly SortByValue[] = sortBy;

    let sortedIcons = icons;
    if (sortKeys.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME)) {
        // Icons built by `useAccountIcons` carry their own `displayName`, so no personal-details lookup is needed here
        sortedIcons = sortIconsByName(icons, undefined, localeCompare);
    } else if (sortKeys.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.ID)) {
        sortedIcons = lodashSortBy(icons, (icon) => icon.id);
    }

    return sortKeys.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE) ? [...sortedIcons].reverse() : sortedIcons;
}

/**
 * Renders several known accounts as an overlapping row of avatars, resolving the icons from the personal-details context
 * (zero Onyx subscriptions). Use `AccountAvatar` when there is exactly one account, and `ReportActionAvatars` when the
 * actors still have to be resolved from a report, a report action or a policy.
 */
function MultiAccountAvatar({
    accountIDs,
    horizontalOptions,
    sortBy,
    invitedEmailsToAccountIDs,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fallbackDisplayName,
    isInReportAction = false,
}: MultiAccountAvatarProps) {
    const {localeCompare} = useLocalize();

    const filteredAccountIDs = accountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);
    const hasAccountsToRender = filteredAccountIDs.length > 0;
    // When no account resolves, render one placeholder avatar instead of collapsing the slot,
    // matching the fallback ReportActionAvatars renders for an empty account list.
    const icons = useAccountIcons(hasAccountsToRender ? filteredAccountIDs : [CONST.DEFAULT_NUMBER_ID], invitedEmailsToAccountIDs);
    const placeholderIcon = icons.at(0);

    if (!hasAccountsToRender && placeholderIcon) {
        return (
            <SingleAvatar
                avatar={placeholderIcon}
                size={size}
                containerStyles={[]}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <HorizontalAvatars
            {...horizontalOptions}
            size={size}
            icons={sortIcons(icons, sortBy, localeCompare)}
            isInReportAction={isInReportAction}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default MultiAccountAvatar;
