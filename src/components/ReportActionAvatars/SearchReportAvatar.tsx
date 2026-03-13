import React from 'react';
import type {ColorValue} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import ReportActionAvatar from './ReportActionAvatar';

type SearchReportAvatarProps = {
    primaryAvatar?: Icon;
    secondaryAvatar?: Icon;
    avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;
    shouldShowTooltip: boolean;
    subscriptAvatarBorderColor: ColorValue;
    reportID: string;
};

function SearchReportAvatar({primaryAvatar, secondaryAvatar, avatarType, shouldShowTooltip, subscriptAvatarBorderColor, reportID}: SearchReportAvatarProps) {
    if (!primaryAvatar) {
        return null;
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && secondaryAvatar) {
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                size={CONST.AVATAR_SIZE.DEFAULT}
                shouldShowTooltip={shouldShowTooltip}
                noRightMarginOnContainer={false}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                reportID={reportID}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && secondaryAvatar) {
        return (
            <ReportActionAvatar.Multiple.Diagonal
                icons={[primaryAvatar, secondaryAvatar]}
                size={CONST.AVATAR_SIZE.DEFAULT}
                shouldShowTooltip={shouldShowTooltip}
                isInReportAction={false}
                useMidSubscriptSize={false}
                reportID={reportID}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            avatar={primaryAvatar}
            size={CONST.AVATAR_SIZE.DEFAULT}
            shouldShowTooltip={shouldShowTooltip}
            accountID={Number(primaryAvatar?.id ?? CONST.DEFAULT_NUMBER_ID)}
            fallbackIcon={primaryAvatar?.fallbackIcon}
            reportID={reportID}
        />
    );
}

export default SearchReportAvatar;
