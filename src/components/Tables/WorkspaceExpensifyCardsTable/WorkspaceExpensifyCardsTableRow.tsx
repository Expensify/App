import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {useSession} from '@components/OnyxListItemProvider';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTranslationKeyForLimitType} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {WorkspaceExpensifyCardTableRowData} from '.';

type WorkspaceExpensifyCardsTableRowProps = {
    /** Data about the Expensify card */
    item: WorkspaceExpensifyCardTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function WorkspaceExpensifyCardsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceExpensifyCardsTableRowProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'FallbackAvatar', 'FreezeCard']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const session = useSession();

    const cardholderName = useMemo(() => getDisplayNameOrDefault(item.cardholder), [item.cardholder]);
    const cardType = item.isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
    const limitTypeLabel = translate(getTranslationKeyForLimitType(item.limitType));
    const formattedLimit = convertToShortDisplayString(item.limit, item.currency);
    const formattedFrozenDate = item.frozenDate ? DateUtils.formatWithUTCTimeZone(item.frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';
    const frozenByAdminPrefix = translate('cardPage.frozenByAdminPrefix', {date: formattedFrozenDate});
    const frozenByText = useMemo(() => {
        if (!formattedFrozenDate) {
            return undefined;
        }

        if (item.frozenByAccountID === session?.accountID) {
            return translate('cardPage.youFroze', {date: formattedFrozenDate});
        }

        return `${frozenByAdminPrefix}${item.frozenByDisplayName ?? translate('common.someone')}`;
    }, [formattedFrozenDate, frozenByAdminPrefix, item.frozenByAccountID, item.frozenByDisplayName, session?.accountID, translate]);

    const accessibilityLabel = [cardholderName, item.name, cardType, limitTypeLabel, item.lastFourPAN, formattedLimit, frozenByText].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            accessibilityLabel={accessibilityLabel}
            skeletonReasonAttributes={{context: 'workspaceExpensifyCardsTableRow'}}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
                onClose: item.onClose,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[shouldUseNarrowTableLayout ? styles.flex4 : styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar
                            source={item.cardholder?.avatar ?? icons.FallbackAvatar}
                            avatarID={item.cardholder?.accountID}
                            type={CONST.ICON_TYPE_AVATAR}
                            size={CONST.AVATAR_SIZE.DEFAULT}
                        />
                        <View style={[styles.flex1, shouldUseNarrowTableLayout && styles.gap1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={cardholderName}
                                style={[styles.optionDisplayName, styles.textStrong, styles.pre]}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.name}
                                style={styles.textLabelSupporting}
                            />
                            {!!frozenByText && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt1]}>
                                    <Icon
                                        src={icons.FreezeCard}
                                        fill={theme.icon}
                                        small
                                    />
                                    <Text style={[styles.textLabelSupporting, styles.colorMuted, styles.ml2]}>{frozenByText}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={cardType}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={limitTypeLabel}
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            shouldUseNarrowTableLayout ? styles.flex2 : styles.flex1,
                            shouldUseNarrowTableLayout ? styles.justifyContentCenter : styles.justifyContentStart,
                        ]}
                    >
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={item.lastFourPAN}
                        />
                    </View>

                    <View
                        style={[
                            shouldUseNarrowTableLayout ? styles.flexColumn : styles.flexRow,
                            shouldUseNarrowTableLayout ? styles.flex3 : styles.flex1,
                            shouldUseNarrowTableLayout ? styles.alignItemsEnd : styles.alignItemsCenter,
                            shouldUseNarrowTableLayout ? styles.justifyContentStart : styles.justifyContentEnd,
                        ]}
                    >
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={formattedLimit}
                        />
                        {shouldUseNarrowTableLayout && (
                            <Text
                                numberOfLines={1}
                                style={styles.textLabelSupporting}
                            >
                                {cardType}
                            </Text>
                        )}
                    </View>

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
