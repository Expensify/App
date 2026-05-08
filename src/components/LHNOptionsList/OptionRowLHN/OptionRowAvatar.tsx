import React from 'react';
import type {ColorValue, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import LHNAvatar from '@components/LHNOptionsList/LHNAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {shouldOptionShowTooltip} from '@libs/OptionsListUtils';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type OptionRowAvatarProps = {
    optionItem: OptionData;
    report: OnyxEntry<Report>;
    isInFocusMode: boolean;
    subscriptAvatarBorderColor: ColorValue;
    secondaryAvatarBackgroundColor: ColorValue;
    singleAvatarContainerStyle: ViewStyle[];
};

function OptionRowAvatarInner({optionItem, report, isInFocusMode, subscriptAvatarBorderColor, secondaryAvatarBackgroundColor, singleAvatarContainerStyle}: OptionRowAvatarProps) {
    const personalDetails = usePersonalDetails();

    const delegateAccountID = getDelegateAccountIDFromReportAction(optionItem?.parentReportAction);

    // Match the header's delegate avatar logic: when a delegate exists on the
    // parent report action, the header (useReportActionAvatars) shows the
    // delegate's avatar as primary instead of the report owner's.
    const skipDelegate = report?.type === CONST.REPORT.TYPE.INVOICE || (optionItem?.isTaskReport && !report?.chatReportID);

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
            subscriptAvatarBorderColor={subscriptAvatarBorderColor}
            useMidSubscriptSize={isInFocusMode}
            secondaryAvatarBackgroundColor={secondaryAvatarBackgroundColor}
            singleAvatarContainerStyle={singleAvatarContainerStyle}
            shouldShowTooltip={shouldOptionShowTooltip(optionItem)}
            delegateAccountID={skipDelegate ? undefined : delegateAccountID}
            delegateTooltipAccountID={delegateTooltipAccountID}
        />
    );
}

OptionRowAvatarInner.displayName = 'OptionRowAvatarInner';

function OptionRowAvatar({optionItem, report, isInFocusMode, subscriptAvatarBorderColor, secondaryAvatarBackgroundColor, singleAvatarContainerStyle}: OptionRowAvatarProps) {
    // Bail out before subscribing to personal details when the row has no avatar to render.
    if (!optionItem.icons?.length || !optionItem.icons.at(0)) {
        return null;
    }
    return (
        <OptionRowAvatarInner
            optionItem={optionItem}
            report={report}
            isInFocusMode={isInFocusMode}
            subscriptAvatarBorderColor={subscriptAvatarBorderColor}
            secondaryAvatarBackgroundColor={secondaryAvatarBackgroundColor}
            singleAvatarContainerStyle={singleAvatarContainerStyle}
        />
    );
}

OptionRowAvatar.displayName = 'OptionRowAvatar';

export default OptionRowAvatar;
