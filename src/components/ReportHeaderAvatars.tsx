import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {UpperCaseCharacters} from 'type-fest/source/internal';

import React from 'react';
import {View} from 'react-native';

import Avatar from './Avatar';
import SingleAvatar from './Avatar/layouts/SingleAvatar';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import useReportActionAvatars from './ReportActionAvatars/useReportActionAvatars';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportHeaderAvatarsProps = {
    /** Report ID used to resolve avatars and for workspace avatar navigation */
    reportID?: string;
};

/**
 * Renders the large pressable avatar(s) shown in the report details header for non-group-chat reports.
 *
 * The subscript markup is duplicated from `SubscriptAvatar` on purpose: here the primary and the subscript avatar each
 * need their own press target and route, which a single pressable around the shared layout cannot provide.
 */
function ReportHeaderAvatars({reportID}: ReportHeaderAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    // reportID can be an empty string causing Onyx to fetch the whole collection
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`);

    const {
        avatarType,
        avatars: icons,
        details: {delegateAccountID},
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

    const getAccessibilityLabel = (icon: Icon) => translate(icon.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile');

    if (!icons.length) {
        return null;
    }

    const [primaryAvatar, secondaryAvatar] = icons;
    const size = CONST.AVATAR_SIZE.X_LARGE;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && !!secondaryAvatar?.name) {
        const subscriptAvatarSize = CONST.AVATAR_SIZE.HEADER;

        return (
            <View
                style={[StyleUtils.getContainerStyles(size), styles.mr0]}
                testID="ReportActionAvatars-Subscript"
            >
                <UserDetailsTooltip
                    shouldRender
                    accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={primaryAvatar}
                    fallbackUserDetails={{
                        displayName: primaryAvatar.name,
                    }}
                >
                    <View>
                        <PressableWithoutFocus
                            onPress={() => navigateToAvatarPage(primaryAvatar)}
                            accessibilityLabel={getAccessibilityLabel(primaryAvatar)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                        >
                            <Avatar
                                containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}
                                type={primaryAvatar.type}
                                source={primaryAvatar.source}
                                name={primaryAvatar.name ?? ''}
                                avatarID={primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                                fallbackIcon={primaryAvatar.fallbackIcon}
                                fill={primaryAvatar.fill}
                                size={size}
                                testID="ReportActionAvatars-Subscript-MainAvatar"
                            />
                        </PressableWithoutFocus>
                    </View>
                </UserDetailsTooltip>
                <UserDetailsTooltip
                    shouldRender
                    accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={secondaryAvatar}
                >
                    <View style={styles.secondAvatarSubscriptXLarge}>
                        <PressableWithoutFocus
                            onPress={() => navigateToAvatarPage(secondaryAvatar)}
                            accessibilityLabel={getAccessibilityLabel(secondaryAvatar)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                        >
                            <Avatar
                                iconAdditionalStyles={[StyleUtils.getAvatarBorderWidth(subscriptAvatarSize), StyleUtils.getBorderColorStyle(theme.componentBG)]}
                                type={secondaryAvatar.type}
                                source={secondaryAvatar.source}
                                name={secondaryAvatar.name ?? ''}
                                avatarID={secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                                fallbackIcon={secondaryAvatar.fallbackIcon}
                                fill={secondaryAvatar.fill}
                                size={subscriptAvatarSize}
                                testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                            />
                        </PressableWithoutFocus>
                    </View>
                </UserDetailsTooltip>
            </View>
        );
    }

    return (
        <PressableWithoutFocus
            onPress={() => navigateToAvatarPage(primaryAvatar)}
            accessibilityLabel={getAccessibilityLabel(primaryAvatar)}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            <SingleAvatar
                avatar={primaryAvatar}
                size={size}
                containerStyles={[]}
                shouldShowTooltip
                accountID={Number(delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            />
        </PressableWithoutFocus>
    );
}

export default ReportHeaderAvatars;
