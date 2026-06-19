import React from 'react';
import type {ColorValue} from 'react-native';
import type {ValueOf} from 'type-fest';
import LHNAvatar from '@components/LHNOptionsList/LHNAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldOptionShowTooltip} from '@libs/OptionsListUtils';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

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
    const personalDetails = usePersonalDetails();

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];

    const delegateAccountID = getDelegateAccountIDFromReportAction(optionItem?.parentReportAction);

    // Match the header's delegate avatar logic: when a delegate exists on the
    // parent report action, the header (useReportActionAvatars) shows the
    // delegate's avatar as primary instead of the report owner's.
    const skipDelegate = optionItem?.type === CONST.REPORT.TYPE.INVOICE || (optionItem?.isTaskReport && !optionItem?.chatReportID);

    let icons = optionItem?.icons ?? [];
    if (!skipDelegate && delegateAccountID && personalDetails && icons.length > 0) {
        const delegateDetails = personalDetails[delegateAccountID];
        if (delegateDetails) {
            const updatedIcons = [...icons];
            const firstDelegateIcon = updatedIcons.at(0);
            if (firstDelegateIcon) {
                updatedIcons[0] = {
                    ...firstDelegateIcon,
                    source: delegateDetails.avatar ?? '',
                    name: delegateDetails.displayName ?? '',
                    id: delegateAccountID,
                };
            }
            icons = updatedIcons;
        }
    }

    let delegateTooltipAccountID: number | undefined;
    if (!skipDelegate && delegateAccountID && personalDetails?.[delegateAccountID] && optionItem?.icons?.length) {
        delegateTooltipAccountID = Number(optionItem.icons.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID);
    }

    return (
        <LHNAvatar
            icons={icons}
            shouldShowSubscript={!!optionItem.shouldShowSubscript}
            size={isInFocusMode ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
            subscriptAvatarBorderColor={avatarBackgroundColor}
            useMidSubscriptSize={isInFocusMode}
            secondaryAvatarBackgroundColor={avatarBackgroundColor}
            singleAvatarContainerStyle={singleAvatarContainerStyle}
            shouldShowTooltip={shouldOptionShowTooltip(optionItem)}
            delegateAccountID={skipDelegate ? undefined : delegateAccountID}
            delegateTooltipAccountID={delegateTooltipAccountID}
        />
    );
}

AvatarInner.displayName = 'OptionRow.AvatarInner';

function Avatar({optionItem, viewMode, avatarBackgroundColor}: AvatarProps) {
    // Bail out before subscribing to personal details when the row has no avatar to render.
    if (!optionItem.icons?.length || !optionItem.icons.at(0)) {
        return null;
    }
    return (
        <AvatarInner
            optionItem={optionItem}
            viewMode={viewMode}
            avatarBackgroundColor={avatarBackgroundColor}
        />
    );
}

Avatar.displayName = 'OptionRow.Avatar';

export default Avatar;
