import React from 'react';
import {View} from 'react-native';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
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
    const hasToRecipent = !!item?.to && !!item?.to?.accountID && !!item?.to?.displayName;
    const participantToDisplayName = item?.to?.displayName ?? item?.to?.login ?? translate('common.hidden');
    const shouldShowToRecipient =
        hasFromSender && hasToRecipent && !!item?.to?.accountID && item?.from?.accountID !== item?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);

    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, shouldShowUserInfo ? styles.justifyContentBetween : styles.justifyContentEnd, styles.pb3, styles.gap2]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                {shouldShowUserInfo && (
                    <UserInfoCellsWithArrow
                        shouldShowToRecipient={shouldShowToRecipient}
                        participantFrom={item?.from}
                        participantFromDisplayName={item?.from?.displayName ?? item?.from?.login ?? translate('common.hidden')}
                        participantToDisplayName={item?.to?.displayName ?? item?.to?.login ?? translate('common.hidden')}
                        participantTo={item?.to}
                        avatarSize="mid-subscript"
                        infoCellsTextStyle={{...styles.textMicroBold, lineHeight: 14}}
                        infoCellsAvatarStyle={styles.pr1}
                        fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}
                    />
                )}
            </View>
            <View>
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
