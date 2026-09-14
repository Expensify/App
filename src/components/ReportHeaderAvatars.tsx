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

import type {AvatarIcon} from './Avatar/types';

import getAvatarLayout from './Avatar/layouts/getAvatarLayout';
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

    const {
        avatarType,
        avatars: icons,
        details: {delegateAccountID},
        source,
    } = useReportActionAvatars({
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

    // The hook substitutes a nameless placeholder icon while the second actor loads, so a name is required for the multi-avatar layouts.
    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({icons, avatarType, shouldRequireSecondaryIconName: true});

    if (!primaryIcon) {
        return null;
    }

    const size = CONST.AVATAR_SIZE.XXXX_LARGE;

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && secondaryIcon) {
        return (
            <PressableDiagonalAvatars
                size={size}
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                iconCount={icons.length}
                onAvatarPress={navigateToAvatarPage}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
            />
        );
    }

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && secondaryIcon) {
        return (
            <PressableSubscriptAvatar
                size={size}
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                onAvatarPress={navigateToAvatarPage}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                containerStyle={styles.mr0}
            />
        );
    }

    const delegateAccountIDFromAction = source.action?.delegateAccountID;
    const singleAvatar: AvatarIcon = delegateAccountIDFromAction
        ? {
              ...primaryIcon,
              copilot: {
                  accountID: delegateAccountIDFromAction,
                  actedForAccountID: delegateAccountID,
              },
          }
        : primaryIcon;

    return (
        <PressableWithoutFocus
            onPress={() => navigateToAvatarPage(primaryIcon)}
            accessibilityLabel={translate(primaryIcon.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile')}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            <SingleAvatar
                avatar={singleAvatar}
                size={size}
                containerStyles={[]}
            />
        </PressableWithoutFocus>
    );
}

export default ReportHeaderAvatars;
