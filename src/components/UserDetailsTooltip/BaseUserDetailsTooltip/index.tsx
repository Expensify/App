import Str from 'expensify-common/lib/str';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import {usePersonalDetails} from '@components/OnyxProvider';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type UserDetailsTooltipProps from '@components/UserDetailsTooltip/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function BaseUserDetailsTooltip({accountID, fallbackUserDetails, icon, delegateAccountID, shiftHorizontal, children}: UserDetailsTooltipProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isCurrentUserAnonymous = session?.accountID === accountID && isAnonymousUser(session);

    const userDetails = personalDetails?.[accountID] ?? fallbackUserDetails ?? {};
    let userDisplayName = ReportUtils.getUserDetailTooltipText(accountID, userDetails.displayName ? userDetails.displayName.trim() : '');
    let userLogin = !isCurrentUserAnonymous && userDetails.login?.trim() && userDetails.login !== userDetails.displayName ? Str.removeSMSDomain(userDetails.login) : '';

    let userAvatar = userDetails.avatar;
    let userAccountID = accountID;

    // We replace the actor's email, name, and avatar with the Copilot manually for now. This will be improved upon when
    // the Copilot feature is implemented.
    if (delegateAccountID) {
        const delegateUserDetails = personalDetails?.[delegateAccountID];
        const delegateUserDisplayName = ReportUtils.getUserDetailTooltipText(delegateAccountID);
        userDisplayName = `${delegateUserDisplayName} (${translate('reportAction.asCopilot')} ${userDisplayName})`;
        userLogin = delegateUserDetails?.login ?? '';
        userAvatar = delegateUserDetails?.avatar;
        userAccountID = delegateAccountID;
    }

    let title = String(userDisplayName).trim() ? userDisplayName : '';
    let subtitle = userLogin.trim() && LocalePhoneNumber.formatPhoneNumber(userLogin) !== userDisplayName ? Str.removeSMSDomain(userLogin) : '';
    if (icon && (icon.type === CONST.ICON_TYPE_WORKSPACE || !title)) {
        title = icon.name ?? '';

        // We need to clear the subtitle for workspaces so that we don't display any user details under the workspace name
        if (icon.type === CONST.ICON_TYPE_WORKSPACE) {
            subtitle = '';
        }
    }
    if (CONST.RESTRICTED_ACCOUNT_IDS.includes(userAccountID) || CONST.RESTRICTED_EMAILS.includes(userLogin.trim())) {
        subtitle = '';
    }
    const renderTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={icon?.source ?? UserUtils.getAvatar(userAvatar, userAccountID)}
                        type={icon?.type ?? CONST.ICON_TYPE_AVATAR}
                        name={icon?.name ?? userLogin}
                        fallbackIcon={icon?.fallbackIcon}
                    />
                </View>
                <Text style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{title}</Text>
                <Text style={[styles.textMicro, styles.fontColorReactionLabel, styles.breakWord, styles.textAlignCenter]}>{subtitle}</Text>
            </View>
        ),

        [
            styles.alignItemsCenter,
            styles.ph2,
            styles.pv2,
            styles.emptyAvatar,
            styles.actionAvatar,
            styles.mt2,
            styles.textMicroBold,
            styles.textReactionSenders,
            styles.textAlignCenter,
            styles.textMicro,
            styles.fontColorReactionLabel,
            styles.breakWord,
            icon,
            userAvatar,
            userAccountID,
            userLogin,
            title,
            subtitle,
        ],
    );

    if (!icon && !userDisplayName && !userLogin) {
        return children;
    }

    return (
        <Tooltip
            shiftHorizontal={shiftHorizontal}
            renderTooltipContent={renderTooltipContent}
            renderTooltipContentKey={[userDisplayName, userLogin]}
            shouldHandleScroll
        >
            {children}
        </Tooltip>
    );
}

BaseUserDetailsTooltip.displayName = 'BaseUserDetailsTooltip';

export default BaseUserDetailsTooltip;
