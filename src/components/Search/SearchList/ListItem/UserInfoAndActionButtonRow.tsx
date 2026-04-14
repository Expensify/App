// NOTE: This component has a static twin in SearchStaticList
// (src/components/Search/SearchStaticList.tsx) used for fast perceived
// performance. If you change the UI here, verify the static version still
// looks visually identical.
import React, {useMemo} from 'react';
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
}: {
    item: TransactionReportGroupListItemType | TransactionListItemType | ExpenseReportListItemType;
    shouldShowUserInfo: boolean;
    containerStyles?: StyleProp<ViewStyle>;
}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const transactionItem = item as unknown as TransactionListItemType;
    const stateNum = transactionItem.report?.stateNum ?? (item as unknown as ExpenseReportListItemType).stateNum;
    const statusNum = transactionItem.report?.statusNum ?? (item as unknown as ExpenseReportListItemType).statusNum;
    const statusText = useMemo(() => getReportStatusTranslation({stateNum, statusNum, translate}), [stateNum, statusNum, translate]);
    const reportStatusColorStyle = useMemo(() => getReportStatusColorStyle(theme, stateNum, statusNum), [theme, stateNum, statusNum]);
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
