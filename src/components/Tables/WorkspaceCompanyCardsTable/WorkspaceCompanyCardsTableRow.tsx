import Button from '@components/Button';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {TableData} from '@components/Table';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatMaskedCardName} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardAssignmentData} from '@src/types/onyx/Card';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type WorkspaceCompanyCardTableRowData = TableData &
    CardAssignmentData & {
        /** Whether the card is deleted */
        isCardDeleted: boolean;

        /** Whether the card is assigned */
        isAssigned: boolean;

        /** Assigned card */
        assignedCard?: Card;

        /** On dismiss error callback */
        onDismissError?: () => void;
    };

type WorkspaceCompanyCardTableRowProps = {
    /** The workspace company card table item */
    item: WorkspaceCompanyCardTableRowData;

    /** Selected card feed */
    feedName?: CompanyCardFeedWithDomainID;

    /** Card feed icon element */
    CardFeedIcon?: React.ReactNode;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** The index of the row */
    rowIndex: number;

    /**
     * Callback when assigning a card.
     * @param cardName - The masked card number displayed to users
     * @param cardID - The identifier sent to backend (equals cardName for direct feeds)
     */
    onAssignCard: (cardName: string, cardID: string) => void;
};

function WorkspaceCompanyCardTableRow({
    item,
    feedName,
    CardFeedIcon,
    shouldUseNarrowTableLayout,
    rowIndex,
    isAssigningCardDisabled,
    canWriteCompanyCards,
    onAssignCard,
}: WorkspaceCompanyCardTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const {cardName, encryptedCardNumber, customCardName, cardholder, assignedCard, isAssigned, errors, pendingAction, isCardDeleted, onDismissError} = item;

    const formattedCustomCardName = customCardName ?? '';
    const formattedCardDetails = formatMaskedCardName(cardName);
    const formattedCustomCardNameSuffix = formattedCustomCardName ? ` • ${formattedCustomCardName}` : '';

    const cardholderLoginText = !shouldUseNarrowTableLayout && isAssigned ? Str.removeSMSDomain(cardholder?.login ?? '') : undefined;
    const narrowWidthCardName = isAssigned ? `${formattedCardDetails}${formattedCustomCardNameSuffix}` : cardName;

    const memberColumnTitle = isAssigned ? Str.removeSMSDomain(cardholder?.displayName ?? '') : translate('workspace.moreFeatures.companyCards.unassignedCards');
    const memberCardSubtitle = shouldUseNarrowTableLayout ? narrowWidthCardName : cardholderLoginText;

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const subscriptCardFeedIconSize = shouldUseNarrowTableLayout
        ? {width: variables.cardAvatarWidth, height: variables.cardAvatarHeight}
        : {width: variables.cardAvatarWidthSmall, height: variables.cardAvatarHeightSmall};

    const canOpenCardDetails = !!assignedCard?.accountID && assignedCard?.cardID !== undefined && !!feedName;
    const canAssignCard = !isAssigned && canWriteCompanyCards && !isAssigningCardDisabled;
    const canPressRow = canOpenCardDetails || canAssignCard;

    const handleRowPress = () => {
        if (!assignedCard) {
            if (!canAssignCard) {
                return;
            }
            onAssignCard(cardName, encryptedCardNumber);

            return;
        }

        const {cardID} = assignedCard;
        if (!canOpenCardDetails || cardID === undefined || !feedName) {
            return;
        }

        return Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(feedName, cardID.toString())));
    };

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={isCardDeleted || !canPressRow}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.TABLE_ITEM}
            offlineWithFeedback={{errors, pendingAction, onClose: onDismissError, shouldHideOnDelete: false}}
            onPress={handleRowPress}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        {isAssigned ? (
                            <ReportActionAvatars
                                noRightMarginOnSubscriptContainer
                                size={avatarSize}
                                accountIDs={cardholder?.accountID ? [cardholder.accountID] : []}
                                subscriptCardFeed={assignedCard?.bank as CompanyCardFeed}
                                subscriptCardFeedIconSize={subscriptCardFeedIconSize}
                                subscriptAvatarBorderColor={hovered ? theme.hoverComponentBG : theme.highlightBG}
                            />
                        ) : (
                            CardFeedIcon
                        )}

                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, shouldUseNarrowTableLayout && styles.gap1]}>
                            <TextWithTooltip
                                text={memberColumnTitle}
                                style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter]}
                            />
                            {!!memberCardSubtitle && (
                                <TextWithTooltip
                                    text={memberCardSubtitle}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mr3]}
                                />
                            )}
                        </View>
                    </View>

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={formattedCardDetails}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={customCardName ?? ''}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        {!isAssigned && canWriteCompanyCards && (
                            <Button
                                small
                                success
                                text={translate('workspace.companyCards.assign')}
                                onPress={handleRowPress}
                                isDisabled={isAssigningCardDisabled}
                            />
                        )}

                        {canPressRow && (
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        )}
                    </View>
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceCompanyCardTableRow;
export type {WorkspaceCompanyCardTableRowData as WorkspaceCompanyCardTableItemData};
