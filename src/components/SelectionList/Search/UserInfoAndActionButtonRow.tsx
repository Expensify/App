import React from 'react';
import {View} from 'react-native';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ActionCell from './ActionCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

function UserInfoAndActionButtonRow({
    item,
    handleActionButtonPress,
    shouldShowUserInfo,
}: {
    item: ReportListItemType | TransactionListItemType;
    handleActionButtonPress: () => void;
    shouldShowUserInfo: boolean;
}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const hasFromSender = !!item?.from && !!item?.from?.accountID && !!item?.from?.displayName;
    const hasToRecipient = !!item?.to && !!item?.to?.accountID && !!item?.to?.displayName;
    const participantFromDisplayName = item?.from?.displayName ?? item?.from?.login ?? translate('common.hidden');
    const participantToDisplayName = item?.to?.displayName ?? item?.to?.login ?? translate('common.hidden');
    const shouldShowToRecipient =
        hasFromSender && hasToRecipient && !!item?.to?.accountID && item?.from?.accountID !== item?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);

    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, shouldShowUserInfo ? styles.justifyContentBetween : styles.justifyContentEnd, styles.gap2, styles.ph3]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                {shouldShowUserInfo && (
                    <UserInfoCellsWithArrow
                        shouldShowToRecipient={shouldShowToRecipient}
                        participantFrom={item?.from}
                        participantFromDisplayName={participantFromDisplayName}
                        participantToDisplayName={participantToDisplayName}
                        participantTo={item?.to}
                        avatarSize={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                        infoCellsTextStyle={{...styles.textMicroBold, lineHeight: 14}}
                        infoCellsAvatarStyle={styles.pr1}
                        fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}
                    />
                )}
            </View>
            <View style={[{width: variables.w80}, styles.alignItemsEnd]}>
                <ActionCell
                    action={item.action}
                    goToItem={handleActionButtonPress}
                    isSelected={item.isSelected}
                    isLoading={item.isActionLoading}
                />
            </View>
        </View>
    );
}

export default UserInfoAndActionButtonRow;
