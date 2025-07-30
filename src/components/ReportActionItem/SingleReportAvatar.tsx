import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import type {ReportAvatarDetails} from '@hooks/useReportAvatarDetails';
import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

function SingleReportAvatar({
    reportPreviewDetails,
    personalDetails,
    containerStyles,
    actorAccountID,
}: {
    reportPreviewDetails: ReportAvatarDetails;
    personalDetails: PersonalDetailsList | undefined;
    containerStyles: ViewStyle[];
    actorAccountID: number | null | undefined;
}) {
    const {primaryAvatar, isWorkspaceActor, fallbackIcon: reportFallbackIcon, reportPreviewAction} = reportPreviewDetails;
    const delegatePersonalDetails = reportPreviewAction?.delegateAccountID ? personalDetails?.[reportPreviewAction?.delegateAccountID] : undefined;

    return (
        <UserDetailsTooltip
            accountID={Number(delegatePersonalDetails && !isWorkspaceActor ? actorAccountID : (primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID))}
            delegateAccountID={reportPreviewAction?.delegateAccountID}
            icon={primaryAvatar}
        >
            <View>
                <Avatar
                    containerStyles={containerStyles}
                    source={primaryAvatar.source}
                    type={primaryAvatar.type}
                    name={primaryAvatar.name}
                    avatarID={primaryAvatar.id}
                    fallbackIcon={reportFallbackIcon}
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default SingleReportAvatar;
