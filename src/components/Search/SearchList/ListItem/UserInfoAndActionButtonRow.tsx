// NOTE: This component has a static twin in SearchStaticList
// (src/components/Search/SearchStaticList.tsx) used for fast perceived
// performance. If you change the UI here, verify the static version still
// looks visually identical.
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import StatusBadge from '@components/StatusBadge';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportStatusColorStyle, getReportStatusTranslation} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ExpenseReportListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './types';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

function UserInfoAndActionButtonRow({
    item,
    shouldShowUserInfo,
    containerStyles,
    stateNum,
    statusNum,
}: {
    item: TransactionReportGroupListItemType | TransactionListItemType | ExpenseReportListItemType;
    shouldShowUserInfo: boolean;
    containerStyles?: StyleProp<ViewStyle>;
    stateNum: ExpenseReportListItemType['stateNum'];
    statusNum: ExpenseReportListItemType['statusNum'];
}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const statusText = getReportStatusTranslation({stateNum, statusNum, translate});
    const reportStatusColorStyle = getReportStatusColorStyle(theme, stateNum, statusNum);
    const participantFromDisplayName = item.formattedFrom ?? item?.from?.displayName ?? '';
    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, shouldShowUserInfo ? styles.justifyContentBetween : styles.justifyContentEnd, styles.gap2, containerStyles]}>
            {shouldShowUserInfo && (
                <UserInfoCellsWithArrow
                    shouldShowToRecipient={false}
                    participantFrom={item?.from}
                    participantFromDisplayName={participantFromDisplayName}
                    participantToDisplayName=""
                    participantTo={item?.to}
                    avatarSize={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                    infoCellsTextStyle={styles.mutedNormalTextLabel}
                    infoCellsAvatarStyle={styles.pr1half}
                    fromRecipientStyle={styles.mw100}
                    shouldUseArrowIcon={false}
                />
            )}
            {!!statusText && !!reportStatusColorStyle && (
                <StatusBadge
                    text={statusText}
                    backgroundColor={reportStatusColorStyle.backgroundColor}
                    textColor={reportStatusColorStyle.textColor}
                />
            )}
        </View>
    );
}

export default UserInfoAndActionButtonRow;
