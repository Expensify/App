import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {UpperCaseCharacters} from 'type-fest/source/internal';

import React from 'react';

import ReportAvatar from './Avatar/connected/ReportAvatar';
import {AvatarPressProvider} from './Avatar/pressable/AvatarPressContext';

type ReportHeaderAvatarsProps = {
    /** Report ID used to resolve avatars and for workspace avatar navigation */
    reportID?: string;
};

/** Report details header avatar(s). Each avatar opens its own page. */
function ReportHeaderAvatars({reportID}: ReportHeaderAvatarsProps) {
    const styles = useThemeStyles();

    const navigateToAvatarPage = (icon: Icon) => {
        const avatarID = icon.id ?? CONST.DEFAULT_NUMBER_ID;

        if (icon.type !== CONST.ICON_TYPE_WORKSPACE) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(Number(avatarID))));
            return;
        }

        if (reportID) {
            Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(reportID, String(avatarID)));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const firstLetter = (icon.name?.at(0) ?? 'A').toUpperCase() as UpperCaseCharacters;
        Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(String(avatarID), firstLetter));
    };

    return (
        <AvatarPressProvider
            onAvatarPress={navigateToAvatarPage}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            <ReportAvatar
                reportID={reportID}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                // Header centers the avatar, so drop the default container styles
                singleAvatarContainerStyle={[]}
                subscriptAvatarContainerStyle={styles.mr0}
            />
        </AvatarPressProvider>
    );
}

export default ReportHeaderAvatars;
