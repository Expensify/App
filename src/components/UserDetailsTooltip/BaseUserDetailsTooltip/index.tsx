import Avatar from '@components/Avatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type UserDetailsTooltipProps from '@components/UserDetailsTooltip/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAnonymousUser} from '@libs/actions/Session';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getUserDetailTooltipText} from '@libs/ReportUtils';
import withRenderTiming from '@libs/telemetry/renderTimings';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback} from 'react';
import {View} from 'react-native';

function BaseUserDetailsTooltip({accountID, fallbackUserDetails, icon, delegateAccountID, shiftHorizontal, children}: UserDetailsTooltipProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    // Reads the two members this tooltip actually needs out of the personal-details collection, instead of
    // subscribing to the whole map through `usePersonalDetails()`. Every write to any other member is now a
    // no-op here: `useOnyx` bails out when the selected member is shallow-equal.
    const [accountPersonalDetails] = useOnyx(`${ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW}${accountID}`);
    const [delegatePersonalDetails] = useOnyx(`${ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW}${getNonEmptyStringOnyxID(delegateAccountID ? String(delegateAccountID) : undefined)}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isCurrentUserAnonymous = session?.accountID === accountID && isAnonymousUser(session);

    const userDetails = accountPersonalDetails ?? fallbackUserDetails ?? {};
    let userDisplayName = getUserDetailTooltipText(accountID, formatPhoneNumber, translate, userDetails.displayName ? userDetails.displayName.trim() : '');
    let userLogin = !isCurrentUserAnonymous && userDetails.login?.trim() && userDetails.login !== userDetails.displayName ? formatPhoneNumber(userDetails.login) : '';

    let userAvatar = userDetails.avatar;
    let userAccountID = accountID;

    // We replace the actor's email, name, and avatar with the Copilot manually for now. This will be improved upon when
    // the Copilot feature is implemented.
    if (delegateAccountID && delegateAccountID > 0) {
        const delegateUserDetails = delegatePersonalDetails;
        const delegateUserDisplayName = getUserDetailTooltipText(delegateAccountID, formatPhoneNumber, translate);
        userDisplayName = `${delegateUserDisplayName} (${translate('reportAction.asCopilot')} ${userDisplayName})`;
        userLogin = delegateUserDetails?.login ?? '';
        userAvatar = delegateUserDetails?.avatar;
        userAccountID = delegateAccountID;
    }

    let title = String(userDisplayName).trim() ? userDisplayName : '';
    let subtitle = userLogin.trim() && formatPhoneNumber(userLogin) !== userDisplayName ? formatPhoneNumber(userLogin) : '';
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
                        source={icon?.source ?? userAvatar}
                        avatarID={icon?.id ?? userAccountID}
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

export default withRenderTiming('BaseUserDetailsTooltip', BaseUserDetailsTooltip);
