import {cardByIdSelector} from '@selectors/Card';
import React, {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import cardScarf from '@assets/images/card-scarf.svg';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
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
    onUnfreezePress: () => void;
};

function FrozenCardIndicator({cardID, onUnfreezePress}: FrozenCardIndicatorProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true, selector: cardByIdSelector(cardID)});

    const frozenData = card?.nameValuePairs?.frozen;
    const frozenByAccountID = frozenData?.byAccountID;
    const frozenDate = frozenData?.date;
    const isCurrentUser = frozenByAccountID === session?.accountID;

    const frozenByName = frozenByAccountID ? getDisplayNameOrDefault(personalDetails?.[frozenByAccountID]) : '';
    const formattedDate = frozenDate ? DateUtils.formatWithUTCTimeZone(frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';

    const statusText = useMemo(() => {
        if (isCurrentUser) {
            return translate('cardPage.youFroze', {date: formattedDate});
        }
        return translate('cardPage.frozenBy', {date: formattedDate, person: frozenByName});
    }, [formattedDate, frozenByName, isCurrentUser, translate]);

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
                    src={Expensicons.FreezeCard}
                    fill={theme.icon}
                    small
                />
                <Text style={[styles.textLabel, styles.colorMuted, styles.ml2]}>{statusText}</Text>
            </View>
            <Button
                medium
                text={translate('cardPage.unfreeze')}
                onPress={onUnfreezePress}
                isDisabled={isOffline}
                style={[styles.mt4]}
            />
        </View>
    );
}

export default FrozenCardIndicator;
