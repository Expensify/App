import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';

import {sortIconsByName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReportAvatarFields} from '@selectors/Report';
import type {ValueOf} from 'type-fest';

import lodashSortBy from 'lodash/sortBy';
import React from 'react';

import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type WorkspaceHorizontalAvatarsProps = {
    /** The report the workspace icon resolves from, through its policy and the chat it links to */
    report: ReportAvatarFields | undefined;

    /** The account the report is about */
    primaryAvatar: Icon;

    /** Size of the avatars */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** How to stack the avatars. `true` takes the stack's defaults */
    horizontalStacking: HorizontalStackingOptions | true;

    /** How to order the avatars before rendering them */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders the given account and the report's workspace icon side by side, in the requested order. */
function WorkspaceHorizontalAvatars({report, primaryAvatar, size, horizontalStacking, sort, fallbackDisplayName}: WorkspaceHorizontalAvatarsProps) {
    const {localeCompare} = useLocalize();
    const personalDetails = usePersonalDetails();
    const workspaceIcon = useReportWorkspaceIcon(report);
    const {isHovered = false, ...stackingOptions} = horizontalStacking === true ? {} : horizontalStacking;
    const sortBy: SortingOption[] = sort === undefined ? [] : [sort].flat();

    let icons: Icon[] = [primaryAvatar, workspaceIcon];
    if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME)) {
        icons = sortIconsByName(icons, personalDetails, localeCompare);
    } else if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.ID)) {
        icons = lodashSortBy(icons, (icon) => icon.id);
    }
    if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE)) {
        icons = [...icons].reverse();
    }

    return (
        <HorizontalAvatars
            {...stackingOptions}
            isHovered={isHovered}
            size={size}
            icons={icons}
            isInReportAction={false}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default WorkspaceHorizontalAvatars;
