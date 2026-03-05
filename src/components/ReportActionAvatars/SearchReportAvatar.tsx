import React from 'react';
import type {ColorValue} from 'react-native';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import ReportActionAvatar from './ReportActionAvatar';

type SearchReportAvatarProps = {
    primaryAvatar?: Icon;
    secondaryAvatar?: Icon;
    isSubscript: boolean;
    shouldShowTooltip: boolean;
    subscriptAvatarBorderColor: ColorValue;
    reportID: string;
};

function SearchReportAvatar({primaryAvatar, secondaryAvatar, isSubscript, shouldShowTooltip, subscriptAvatarBorderColor, reportID}: SearchReportAvatarProps) {
    if (!primaryAvatar) {
        return;
    }

    if (isSubscript && secondaryAvatar) {
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
