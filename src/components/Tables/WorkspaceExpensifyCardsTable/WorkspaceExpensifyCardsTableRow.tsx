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

import {getTranslationKeyForCardStatus, getTranslationKeyForLimitType} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceExpensifyCardTableRowData} from '.';

import getFrozenByText from './getFrozenByText';

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

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const cardholderName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: item.cardholder, translate});
    const narrowLayoutSubtitle = [item.lastFourPAN, item.name].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `);
    const cardType = item.isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
    const limitTypeLabel = translate(getTranslationKeyForLimitType(item.limitType));
    const statusTranslationKey = getTranslationKeyForCardStatus(item.card.state, item.isVirtual);
    const statusLabel = statusTranslationKey ? translate(statusTranslationKey) : '';
    const formattedLimit = convertToShortDisplayString(item.limit, item.currency);
    const frozenByText = getFrozenByText(item, translate, session?.accountID);

    const accessibilityLabel = [cardholderName, item.name, cardType, limitTypeLabel, item.lastFourPAN, statusLabel, formattedLimit, frozenByText].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            accessibilityLabel={accessibilityLabel}
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
                    <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <Avatar
                            source={item.cardholder?.avatar ?? icons.FallbackAvatar}
                            avatarID={item.cardholder?.accountID}
                            type={CONST.ICON_TYPE_AVATAR}
                            size={avatarSize}
                        />
                        <View style={[styles.flex1, shouldUseNarrowTableLayout && styles.gap1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={cardholderName}
                                style={[styles.optionDisplayName, styles.pre]}
                            />
                            {shouldUseNarrowTableLayout ? (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={narrowLayoutSubtitle}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mr3]}
                                />
                            ) : (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.name}
                                    style={styles.textLabelSupporting}
                                />
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
                        <View style={[styles.flex1, styles.mnw0, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={limitTypeLabel}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.lastFourPAN}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.mnw0, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={statusLabel}
                            />
                        </View>
                    )}

                    <View
                        style={[
                            shouldUseNarrowTableLayout ? styles.flexColumn : styles.flexRow,
                            shouldUseNarrowTableLayout ? styles.alignItemsEnd : styles.flex1,
                            shouldUseNarrowTableLayout ? styles.justifyContentStart : styles.alignItemsCenter,
                            shouldUseNarrowTableLayout ? undefined : styles.justifyContentEnd,
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

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
