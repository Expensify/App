import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {ThemeColors} from '@styles/theme/types';
import variables from '@styles/variables';
import type {ThemeStyles} from '@src/styles';
import type {PersonalDetails} from '@src/types/onyx';
import type {SearchPersonalDetails} from '@src/types/onyx/SearchResults';
import UserInfoCell from './UserInfoCell';

function UserInfoCellsWithArrow({
    styles,
    theme,
    shouldDisplayArrowIcon,
    participantFrom,
    participantFromDisplayName,
    participantTo,
    participantToDisplayName,
}: {
    styles: ThemeStyles;
    theme: ThemeColors;
    shouldDisplayArrowIcon: boolean;
    participantFrom: SearchPersonalDetails | PersonalDetails;
    participantFromDisplayName: string;
    participantTo: SearchPersonalDetails | PersonalDetails;
    participantToDisplayName: string;
}) {
    return (
        <>
            <View style={[styles.mw50]}>
                <UserInfoCell
                    participant={participantFrom}
                    displayName={participantFromDisplayName}
                />
            </View>
            {shouldDisplayArrowIcon && (
                <Icon
                    src={Expensicons.ArrowRightLong}
                    width={variables.iconSizeXXSmall}
                    height={variables.iconSizeXXSmall}
                    fill={theme.icon}
                />
            )}
            <View style={[styles.flex1, styles.mw50]}>
                <UserInfoCell
                    participant={participantTo}
                    displayName={participantToDisplayName}
                />
            </View>
        </>
    );
}

export default UserInfoCellsWithArrow;
