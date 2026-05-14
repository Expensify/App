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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';

type FrozenCardHeaderProps = {
    cardPreview: React.ReactNode;
    children?: React.ReactNode;
    onUnfreezePress: () => void;
    onAskToUnfreezePress: () => void;
    canUnfreezeCard: boolean;
    isWorkspaceAdmin: boolean;
    frozenByAccountID?: number;
    frozenDate?: string;
};

type ActionButtonElementProps = {
    innerStyles?: React.ComponentProps<typeof Button>['innerStyles'];
    style?: React.ComponentProps<typeof Button>['style'];
};

function FrozenCardHeader({cardPreview, children, onUnfreezePress, onAskToUnfreezePress, canUnfreezeCard, isWorkspaceAdmin, frozenByAccountID, frozenDate}: FrozenCardHeaderProps) {
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
    const actionButtons = React.Children.toArray(children).filter((child): child is React.ReactElement<ActionButtonElementProps> => React.isValidElement<ActionButtonElementProps>(child));
    const shouldUseEqualButtonWidths = actionButtons.length > 0;
    const equalButtonStyles = shouldUseEqualButtonWidths ? [styles.flexGrow1, styles.flexShrink1, styles.flexBasis0, {minWidth: variables.cardDetailsActionButtonMinWidth}] : undefined;
    const equalButtonInnerStyles = shouldUseEqualButtonWidths ? styles.ph2 : undefined;

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
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.mt2]}>
                <Icon
                    src={icons.FreezeCard}
                    fill={theme.icon}
                    small
                />
                <Text style={[styles.textLabel, styles.colorMuted, styles.ml2]}>{statusText}</Text>
            </View>
            <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2, styles.mt6, styles.alignSelfStretch]}>
                <Button
                    medium
                    text={translate(canUnfreezeCard ? 'cardPage.unfreezeCard' : 'cardPage.askToUnfreeze')}
                    icon={icons.FreezeCard}
                    iconFill={theme.icon}
                    onPress={canUnfreezeCard ? onUnfreezePress : onAskToUnfreezePress}
                    isDisabled={canUnfreezeCard && isOffline}
                    innerStyles={equalButtonInnerStyles}
                    style={[styles.alignSelfStart, styles.flexShrink0, equalButtonStyles]}
                />
                {actionButtons.map((button) =>
                    shouldUseEqualButtonWidths
                        ? React.cloneElement(button, {
                              innerStyles: [equalButtonInnerStyles, button.props.innerStyles],
                              style: [button.props.style, equalButtonStyles],
                          })
                        : button,
                )}
            </View>
        </View>
    );
}

export default FrozenCardHeader;
