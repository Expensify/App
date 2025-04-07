import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPolicy} from '@libs/PolicyUtils';
import {getIcons, getReportName, getReportOrDraftReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type RoomInfoCellProps = {
    reportID: string;
};

function RoomInfoCell({reportID}: RoomInfoCellProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const report = getReportOrDraftReport(reportID);

    if (!report || !personalDetails) {
        return null;
    }

    const policy = getPolicy(report.policyID);
    const reportName = getReportName(report, policy, undefined, undefined);
    const icons = getIcons(report, personalDetails, null, '', -1, policy);

    const icon = icons?.at(0);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {!!icon && (
                <Avatar
                    source={icon.source}
                    name={icon.name}
                    avatarID={icon.id}
                    type={icon.type}
                    fallbackIcon={icon.fallbackIcon}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    containerStyles={[styles.pr2]}
                />
            )}

            <Text
                numberOfLines={1}
                style={[isLargeScreenWidth ? styles.themeTextColor : styles.textMicroBold, styles.flexShrink1]}
            >
                {reportName}
            </Text>
        </View>
    );
}

RoomInfoCell.displayName = 'RoomInfoCell';

export default RoomInfoCell;
