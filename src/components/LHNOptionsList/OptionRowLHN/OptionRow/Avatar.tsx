import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import type {AvatarIcon} from '@components/Avatar/types';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import withRenderTiming from '@libs/telemetry/renderTimings';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type AvatarProps = {
    /** Option data for the row. Source of avatar icons, subscript flag, tooltip eligibility, and delegate metadata. */
    optionItem: OptionData;

    /** Display density mode. `COMPACT` switches the avatar size to `SMALL`. */
    viewMode: OptionMode;

    /** Background color used for both the subscript icon border and the secondary avatar background. Matches the row background so the chrome blends in. */
    avatarBackgroundColor: ColorValue;
};

function AvatarInner({optionItem, viewMode, avatarBackgroundColor}: AvatarProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];
    const avatarSize = isInFocusMode ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;

    const delegateAccountID = getDelegateAccountIDFromReportAction(optionItem?.parentReportAction);

    // The delegate is the only member this row reads, so it subscribes to that one collection member rather
    // than to the whole map through `usePersonalDetails()`. Rows without a delegate now subscribe to nothing.
    const [delegateDetails] = useOnyx(`${ONYXKEYS.COLLECTION.PERSONAL_DETAILS_SHADOW}${getNonEmptyStringOnyxID(delegateAccountID ? String(delegateAccountID) : undefined)}`);

    // Match the header's delegate avatar logic: when a delegate exists on the
    // parent report action, the header (useReportActionAvatars) shows the
    // delegate's avatar as primary instead of the report owner's.
    const skipDelegate = optionItem?.type === CONST.REPORT.TYPE.INVOICE || (optionItem?.isTaskReport && !optionItem?.chatReportID);

    let icons: AvatarIcon[] = optionItem?.icons ?? [];
    if (!skipDelegate && delegateAccountID && icons.length > 0) {
        if (delegateDetails) {
            const updatedIcons = [...icons];
            const firstDelegateIcon = updatedIcons.at(0);
            if (firstDelegateIcon) {
                updatedIcons[0] = {
                    ...firstDelegateIcon,
                    source: delegateDetails.avatar ?? '',
                    name: delegateDetails.displayName ?? '',
                    id: delegateAccountID,
                    copilot: {
                        accountID: delegateAccountID,
                        actedForAccountID: Number(firstDelegateIcon.id ?? CONST.DEFAULT_NUMBER_ID),
                    },
                };
            }
            icons = updatedIcons;
        }
    }

    const avatarType = optionItem.shouldShowSubscript ? CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT : CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({icons, avatarType});

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && primaryIcon && secondaryIcon) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={avatarSize}
                subscriptAvatarBorderColor={avatarBackgroundColor}
            />
        );
    }

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && primaryIcon && secondaryIcon) {
        return (
            <DiagonalAvatars
                size={avatarSize}
                // Only the two rendered icons are passed: a longer array makes DiagonalAvatars replace the secondary avatar with a "+N" overflow count.
                icons={[primaryIcon, secondaryIcon]}
                isInReportAction={false}
                secondaryAvatarContainerStyle={StyleUtils.getBackgroundAndBorderStyle(avatarBackgroundColor)}
            />
        );
    }

    if (!primaryIcon) {
        return null;
    }

    return (
        <SingleAvatar
            avatar={primaryIcon}
            size={avatarSize}
            containerStyles={singleAvatarContainerStyle}
        />
    );
}

AvatarInner.displayName = 'OptionRow.AvatarInner';

const TimedAvatarInner = withRenderTiming('LHN.OptionRow.Avatar', AvatarInner);

function Avatar({optionItem, viewMode, avatarBackgroundColor}: AvatarProps) {
    // Bail out before subscribing to personal details when the row has no avatar to render.
    if (!optionItem.icons?.length || !optionItem.icons.at(0)) {
        return null;
    }

    const avatars = (
        <TimedAvatarInner
            optionItem={optionItem}
            viewMode={viewMode}
            avatarBackgroundColor={avatarBackgroundColor}
        />
    );

    // An archived room's participants can no longer be interacted with, so their details are not worth surfacing on hover.
    return optionItem.private_isArchived ? <AvatarTooltipsProvider isEnabled={false}>{avatars}</AvatarTooltipsProvider> : avatars;
}

Avatar.displayName = 'OptionRow.Avatar';

export default Avatar;
