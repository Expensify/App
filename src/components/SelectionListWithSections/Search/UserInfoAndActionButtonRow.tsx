import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useSearchContext} from '@components/Search/SearchContext';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchReport} from '@src/types/onyx/SearchResults';
import ActionCell from './ActionCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

function UserInfoAndActionButtonRow({
    item,
    handleActionButtonPress,
    shouldShowUserInfo,
    containerStyles,
}: {
    item: TransactionReportGroupListItemType | TransactionListItemType;
    handleActionButtonPress: () => void;
    shouldShowUserInfo: boolean;
    containerStyles?: StyleProp<ViewStyle>;
}) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const transactionItem = item as unknown as TransactionListItemType;
    const {currentSearchHash} = useSearchContext();
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});
    const hasFromSender = !!item?.from && !!item?.from?.accountID && !!item?.from?.displayName;
    const hasToRecipient = !!item?.to && !!item?.to?.accountID && !!item?.to?.displayName;
    const participantFromDisplayName = item?.from?.displayName ?? item?.from?.login ?? translate('common.hidden');
    const participantToDisplayName = item?.to?.displayName ?? item?.to?.login ?? translate('common.hidden');
    const shouldShowToRecipient = hasFromSender && hasToRecipient && !!item?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);

    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] ?? {}) as SearchReport;
    }, [snapshot, transactionItem.reportID]);

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
                    isLoading={item.isActionLoading ?? snapshotReport.isActionLoading}
                    policyID={item.policyID}
                    reportID={item.reportID}
                    hash={item.hash}
                    amount={(item as TransactionListItemType)?.amount ?? (item as TransactionReportGroupListItemType)?.total}
                    extraSmall={!isLargeScreenWidth}
                />
            </View>
        </View>
    );
}

export default UserInfoAndActionButtonRow;
