import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import Button from './Button';
import Text from './Text';
import TextLink from './TextLink';

type FrozenCardHeaderProps = {
    cardPreview: React.ReactNode;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onUnfreezePress: () => void;
    onAskToUnfreezePress: () => void;
    canUnfreezeCard: boolean;
    isWorkspaceAdmin: boolean;
    frozenByAccountID?: number;
    frozenDate?: string;
};

function FrozenCardHeader({cardPreview, children, style, onUnfreezePress, onAskToUnfreezePress, canUnfreezeCard, isWorkspaceAdmin, frozenByAccountID, frozenDate}: FrozenCardHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FreezeCard']);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isCurrentUser = frozenByAccountID === session?.accountID;

    const frozenByName = frozenByAccountID ? temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[frozenByAccountID], translate}) : '';
    const formattedDate = frozenDate ? DateUtils.formatWithUTCTimeZone(frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';
    const adminFrozenTextPrefix = translate('cardPage.frozenByAdminPrefix', {date: formattedDate});
    const frozenNeedsUnfreezePrefix = translate('cardPage.frozenByAdminNeedsUnfreezePrefix');
    const frozenNeedsUnfreezeSuffix = translate('cardPage.frozenByAdminNeedsUnfreezeSuffix');
    const actionButtons = React.Children.toArray(children);
    const shouldUseEqualButtonWidths = actionButtons.length > 0;
    const equalButtonWrapperStyles = shouldUseEqualButtonWidths
        ? [styles.flexGrow1, styles.flexShrink1, styles.flexBasis0, {minWidth: variables.cardDetailsActionButtonMinWidth}]
        : undefined;
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
                        onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(Number(frozenByAccountID))))}
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
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(Number(frozenByAccountID))))}
                    style={[styles.textLabel, styles.link]}
                >
                    {frozenByName}
                </TextLink>
                {frozenNeedsUnfreezeSuffix}
            </>
        );
    }

    return (
        <View style={[styles.ph5, styles.pb5, style]}>
            {cardPreview}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.mt2]}>
                <Text style={[styles.textLabel, styles.colorMuted]}>{statusText}</Text>
            </View>
            <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2, styles.mt6, styles.alignSelfStretch]}>
                <View style={equalButtonWrapperStyles}>
                    <Button
                        medium
                        text={translate(canUnfreezeCard ? 'cardPage.unfreezeCard' : 'cardPage.askToUnfreeze')}
                        icon={icons.FreezeCard}
                        onPress={canUnfreezeCard ? onUnfreezePress : onAskToUnfreezePress}
                        isDisabled={canUnfreezeCard && isOffline}
                        innerStyles={equalButtonInnerStyles}
                        style={shouldUseEqualButtonWidths ? styles.w100 : styles.alignSelfStart}
                    />
                </View>
                {shouldUseEqualButtonWidths
                    ? actionButtons.map((button, index) => (
                          <View
                              // eslint-disable-next-line react/no-array-index-key
                              key={index}
                              style={equalButtonWrapperStyles}
                          >
                              {button}
                          </View>
                      ))
                    : children}
            </View>
        </View>
    );
}

export default FrozenCardHeader;
