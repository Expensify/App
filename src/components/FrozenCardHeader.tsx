import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';

type FrozenCardHeaderProps = {
    cardPreview: React.ReactNode;
    onUnfreezePress: () => void;
    onAskToUnfreezePress: () => void;
    canUnfreezeCard: boolean;
    isWorkspaceAdmin: boolean;
    frozenByAccountID?: number;
    frozenDate?: string;
};

function FrozenCardHeader({cardPreview, onUnfreezePress, onAskToUnfreezePress, canUnfreezeCard, isWorkspaceAdmin, frozenByAccountID, frozenDate}: FrozenCardHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FreezeCard']);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isCurrentUser = frozenByAccountID === session?.accountID;

    const frozenByName = frozenByAccountID ? getDisplayNameOrDefault(personalDetails?.[frozenByAccountID]) : '';
    const formattedDate = frozenDate ? DateUtils.formatWithUTCTimeZone(frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';
    const adminFrozenTextPrefix = translate('cardPage.frozenByAdminPrefix', {date: formattedDate});
    const frozenNeedsUnfreezePrefix = translate('cardPage.frozenByAdminNeedsUnfreezePrefix');
    const frozenNeedsUnfreezeSuffix = translate('cardPage.frozenByAdminNeedsUnfreezeSuffix');

    let statusText: React.ReactNode;

    if (isCurrentUser) {
        statusText = translate('cardPage.youFroze', {date: formattedDate});
    } else if (isWorkspaceAdmin) {
        if (!frozenByAccountID || !frozenByName) {
            statusText = `${adminFrozenTextPrefix}${translate('common.someone')}`;
        } else {
            statusText = (
                <>
                    {adminFrozenTextPrefix}
                    <TextLink
                        onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(Number(frozenByAccountID), Navigation.getActiveRoute()))}
                        style={[styles.textLabel, styles.link]}
                    >
                        {frozenByName}
                    </TextLink>
                </>
            );
        }
    } else if (!frozenByAccountID || !frozenByName) {
        statusText = translate('cardPage.frozenByAdminNeedsUnfreeze', {person: frozenByName || translate('common.someone')});
    } else {
        statusText = (
            <>
                {frozenNeedsUnfreezePrefix}
                <TextLink
                    onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(Number(frozenByAccountID), Navigation.getActiveRoute()))}
                    style={[styles.textLabel, styles.link]}
                >
                    {frozenByName}
                </TextLink>
                {frozenNeedsUnfreezeSuffix}
            </>
        );
    }

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
                text={translate(canUnfreezeCard ? 'cardPage.unfreeze' : 'cardPage.askToUnfreeze')}
                onPress={canUnfreezeCard ? onUnfreezePress : onAskToUnfreezePress}
                isDisabled={canUnfreezeCard && isOffline}
                style={[styles.mt4]}
            />
        </View>
    );
}

export default FrozenCardHeader;
