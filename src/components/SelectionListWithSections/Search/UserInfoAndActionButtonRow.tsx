import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import ActionCell from './ActionCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

function UserInfoAndActionButtonRow({
    item,
    handleActionButtonPress,
    shouldShowUserInfo,
    containerStyles,
    isInMobileSelectionMode,
}: {
    item: TransactionReportGroupListItemType | TransactionListItemType;
    handleActionButtonPress: () => void;
    shouldShowUserInfo: boolean;
    containerStyles?: StyleProp<ViewStyle>;
    isInMobileSelectionMode: boolean;
}) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const transactionItem = item as unknown as TransactionListItemType;
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});
    const hasFromSender = !!item?.from && !!item?.from?.accountID && !!item?.from?.displayName;
    const hasToRecipient = !!item?.to && !!item?.to?.accountID && !!item?.to?.displayName;
    const participantFromDisplayName = item.formattedFrom ?? item?.from?.displayName ?? '';
    const participantToDisplayName = item.formattedTo ?? item?.to?.displayName ?? '';
    const shouldShowToRecipient = hasFromSender && hasToRecipient && !!item?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);
    return (
        <View
            style={[
                styles.pt0,
                styles.flexRow,
                styles.alignItemsCenter,
                shouldShowUserInfo ? styles.justifyContentBetween : styles.justifyContentEnd,
                styles.gap2,
                styles.ph3,
                containerStyles,
            ]}
        >
            {shouldShowUserInfo && (
                <UserInfoCellsWithArrow
                    shouldShowToRecipient={shouldShowToRecipient}
                    participantFrom={item?.from}
                    participantFromDisplayName={participantFromDisplayName}
                    participantToDisplayName={participantToDisplayName}
                    participantTo={item?.to}
                    avatarSize={!isLargeScreenWidth ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                    infoCellsTextStyle={{lineHeight: 14}}
                    infoCellsAvatarStyle={styles.pr1}
                    fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}
                    shouldUseArrowIcon={false}
                />
            )}
            <View style={[{width: isLargeScreenWidth ? variables.w80 : variables.w72}, styles.alignItemsEnd]}>
                <ActionCell
                    action={item.action}
                    goToItem={handleActionButtonPress}
                    isSelected={item.isSelected}
                    isLoading={isActionLoading}
                    policyID={item.policyID}
                    reportID={item.reportID}
                    hash={item.hash}
                    amount={(item as TransactionListItemType)?.amount ?? (item as TransactionReportGroupListItemType)?.total}
                    extraSmall={!isLargeScreenWidth}
                    shouldDisablePointerEvents={isInMobileSelectionMode}
                />
            </View>
        </View>
    );
}

export default UserInfoAndActionButtonRow;
