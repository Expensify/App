import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {UpperCaseCharacters} from 'type-fest/source/internal';

import React from 'react';

import PressableDiagonalAvatars from './Avatar/layouts/PressableDiagonalAvatars';
import PressableSubscriptAvatar from './Avatar/layouts/PressableSubscriptAvatar';
import SingleAvatar from './Avatar/layouts/SingleAvatar';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import useReportActionAvatars from './ReportActionAvatars/useReportActionAvatars';

type ReportHeaderAvatarsProps = {
    /** Report ID used to resolve avatars and for workspace avatar navigation */
    reportID?: string;
};

/**
 * Renders the large pressable avatar(s) shown in the report details header for non-group-chat reports.
 * Each avatar is its own press target with its own route, provided by the pressable layout variants.
 */
function ReportHeaderAvatars({reportID}: ReportHeaderAvatarsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    const {avatarType, avatars: icons} = useReportActionAvatars({
        report,
        action: undefined,
    });

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

    if (!icons.length) {
        return null;
    }

    const [primaryAvatar, secondaryAvatar] = icons;
    const size = CONST.AVATAR_SIZE.XXXX_LARGE;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE && !!secondaryAvatar) {
        return (
            <PressableDiagonalAvatars
                size={size}
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                iconCount={icons.length}
                onAvatarPress={navigateToAvatarPage}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && !!secondaryAvatar?.name) {
        return (
            <PressableSubscriptAvatar
                size={size}
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                onAvatarPress={navigateToAvatarPage}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                containerStyle={styles.mr0}
            />
        );
    }

    return (
        <PressableWithoutFocus
            onPress={() => navigateToAvatarPage(primaryAvatar)}
            accessibilityLabel={translate(primaryAvatar.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile')}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            <SingleAvatar
                avatar={primaryAvatar}
                size={size}
                containerStyles={[]}
                shouldShowTooltip
            />
        </PressableWithoutFocus>
    );
}

export default ReportHeaderAvatars;
