import React from 'react';
import type {UpperCaseCharacters} from 'type-fest/source/internal';
import Avatar from '@components/Avatar';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import useLocalize from '@hooks/useLocalize';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

type ProfileAvatarProps = Parameters<typeof Avatar>[0] & {
    /** Whether clicking the avatar navigates to the profile/workspace page */
    useProfileNavigationWrapper?: boolean;

    /** Report ID used for avatar navigation */
    reportID?: string;
};

/** `ProfileAvatar` wraps an `Avatar` in a pressable that navigates to the correct "view avatar" route.
 * The branch it picks depends on `type` (workspace vs user) and whether a `reportID` is provided.
 */
function ProfileAvatar(props: ProfileAvatarProps) {
    const {translate} = useLocalize();
    const {avatarID, useProfileNavigationWrapper, type, name, reportID} = props;

    if (!useProfileNavigationWrapper) {
        return <Avatar {...{...props, useProfileNavigationWrapper: undefined}} />;
    }

    const isWorkspace = type === CONST.ICON_TYPE_WORKSPACE;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const firstLetter = (name?.at(0) ?? 'A').toUpperCase() as UpperCaseCharacters;

    const onPress = () => {
        if (isWorkspace) {
            if (reportID) {
                Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(reportID, String(avatarID)));
                return;
            }
            return Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(String(avatarID), firstLetter));
        }

        return Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(Number(avatarID))));
    };

    return (
        <PressableWithoutFocus
            onPress={onPress}
            accessibilityLabel={translate(isWorkspace ? 'common.workspaces' : 'common.profile')}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            <Avatar {...{...props, useProfileNavigationWrapper: undefined}} />
        </PressableWithoutFocus>
    );
}

export default ProfileAvatar;
