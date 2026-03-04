import {cardByIdSelector} from '@selectors/Card';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';
import Icon from './Icon';
import Text from './Text';

type FrozenCardHeaderProps = {
    cardID: string;
    cardPreview: React.ReactNode;
    onUnfreezePress: () => void;
    onAskToUnfreezePress: () => void;
};

function FrozenCardHeader({cardID, cardPreview, onUnfreezePress, onAskToUnfreezePress}: FrozenCardHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FreezeCard'] as const);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(cardID)});

    const frozenByAccountID = card?.nameValuePairs?.frozen?.byAccountID;
    const frozenDate = card?.nameValuePairs?.frozen?.date;
    const isCurrentUser = frozenByAccountID === session?.accountID;

    const frozenByName = frozenByAccountID ? getDisplayNameOrDefault(personalDetails?.[frozenByAccountID]) : '';
    const formattedDate = frozenDate ? DateUtils.formatWithUTCTimeZone(frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';

    const statusText = useMemo(() => {
        if (isCurrentUser) {
            return translate('cardPage.youFroze', {date: formattedDate});
        }
        return translate('cardPage.frozenByAdminNeedsUnfreeze', {person: frozenByName || translate('common.someone')});
    }, [isCurrentUser, formattedDate, frozenByName, translate]);

    return (
        <View style={[styles.ph5, styles.pb5]}>
            {cardPreview}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt9]}>
                <Icon
                    src={icons.FreezeCard}
                    fill={theme.icon}
                    small
                />
                <Text style={[styles.textLabel, styles.colorMuted, styles.ml2]}>{statusText}</Text>
            </View>
            <Button
                medium
                text={translate(isCurrentUser ? 'cardPage.unfreeze' : 'cardPage.askToUnfreeze')}
                onPress={isCurrentUser ? onUnfreezePress : onAskToUnfreezePress}
                isDisabled={isCurrentUser && isOffline}
                style={[styles.mt4]}
            />
        </View>
    );
}

export default FrozenCardHeader;
