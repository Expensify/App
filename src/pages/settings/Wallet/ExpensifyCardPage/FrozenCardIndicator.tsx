import {cardByIdSelector} from '@selectors/Card';
import React, {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import cardScarf from '@assets/images/card-scarf.svg';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type FrozenCardIndicatorProps = {
    cardID: string;
    canUnfreezeCard: boolean;
    onAskToUnfreezePress: () => void;
    onUnfreezePress: () => void;
};

function FrozenCardIndicator({cardID, canUnfreezeCard, onAskToUnfreezePress, onUnfreezePress}: FrozenCardIndicatorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FreezeCard'] as const);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(cardID)});

    const frozenData = card?.nameValuePairs?.frozen;
    const frozenByAccountID = frozenData?.byAccountID;
    const frozenDate = frozenData?.date;
    const frozenByName = frozenByAccountID ? getDisplayNameOrDefault(personalDetails?.[frozenByAccountID]) : '';
    const formattedDate = frozenDate ? DateUtils.formatWithUTCTimeZone(frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';

    const statusText = useMemo(() => {
        if (canUnfreezeCard) {
            return translate('cardPage.youFroze', {date: formattedDate});
        }
        return translate('cardPage.frozenByAdminNeedsUnfreeze', {person: frozenByName || translate('common.someone')});
    }, [canUnfreezeCard, formattedDate, frozenByName, translate]);

    const scarfOverlayStyle = useMemo<ViewStyle>(
        () => ({
            top: 0,
            left: (variables.cardPreviewWidth - variables.cardScarfOverlayWidth) / 2,
            zIndex: variables.cardScarfOverlayZIndex,
            width: variables.cardScarfOverlayWidth,
            height: variables.cardScarfOverlayHeight,
        }),
        [],
    );

    return (
        <View style={[styles.ph5, styles.pb5, styles.mt9]}>
            <CardPreview
                overlayImage={cardScarf}
                overlayContainerStyle={scarfOverlayStyle}
            />
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
                text={translate(canUnfreezeCard ? 'cardPage.unfreeze' : 'cardPage.askToUnfreeze')}
                onPress={canUnfreezeCard ? onUnfreezePress : onAskToUnfreezePress}
                isDisabled={canUnfreezeCard && isOffline}
                style={[styles.mt4]}
            />
        </View>
    );
}

export default FrozenCardIndicator;
