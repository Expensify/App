import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatMaskedCardName, getCardFeedWithDomainID} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardAssignmentData} from '@src/types/onyx/Card';
import WorkspaceCompanyCardsTableSkeleton from './WorkspaceCompanyCardsTableSkeleton';

type WorkspaceCompanyCardTableRowData = CardAssignmentData & {
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

    /** Policy ID */
    policyID: string;

    /** Card feed icon element */
    CardFeedIcon?: React.ReactNode;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

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

function WorkspaceCompanyCardTableRow({item, policyID, CardFeedIcon, shouldUseNarrowTableLayout, rowIndex, isAssigningCardDisabled, onAssignCard}: WorkspaceCompanyCardTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const {cardName, encryptedCardNumber, customCardName, cardholder, assignedCard, isAssigned, errors, pendingAction, isCardDeleted, onDismissError} = item;

    const isDeleting = !isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const formattedCustomCardName = customCardName ?? '';
    const formattedCardDetails = formatMaskedCardName(cardName);
    const formattedCustomCardNameSuffix = formattedCustomCardName ? ` • ${formattedCustomCardName}` : '';

    const cardholderLoginText = !shouldUseNarrowTableLayout && isAssigned ? Str.removeSMSDomain(cardholder?.login ?? '') : undefined;
    const narrowWidthCardName = isAssigned ? `${formattedCardDetails}${formattedCustomCardNameSuffix}` : cardName;

    const memberColumnTitle = isAssigned ? Str.removeSMSDomain(cardholder?.displayName ?? '') : translate('workspace.moreFeatures.companyCards.unassignedCards');
    const memberCardSubtitle = shouldUseNarrowTableLayout ? narrowWidthCardName : cardholderLoginText;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceCompanyCardsTableItem',
        isDeleting,
    };

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const subscriptCardFeedIconSize = shouldUseNarrowTableLayout
        ? {width: variables.cardAvatarWidth, height: variables.cardAvatarHeight}
        : {width: variables.cardAvatarWidthSmall, height: variables.cardAvatarHeightSmall};

    const handleRowPress = () => {
        if (!assignedCard) {
            onAssignCard(cardName, encryptedCardNumber);

            return;
        }

        if (!assignedCard?.accountID || !assignedCard?.fundID) {
            return;
        }

        const feedName = getCardFeedWithDomainID(assignedCard?.bank as CompanyCardFeed, assignedCard.fundID);

        return Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, feedName as CompanyCardFeedWithDomainID, assignedCard.cardID.toString()));
    };

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            isLoading={isDeleting}
            disabled={isCardDeleted}
            skeletonReasonAttributes={reasonAttributes}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.TABLE_ITEM}
            LoadingComponent={WorkspaceCompanyCardsTableSkeleton}
            onPress={handleRowPress}
            offlineWithFeedback={{errors, pendingAction, onClose: onDismissError, shouldHideOnDelete: false}}
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
                        <View style={[styles.flex1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {formattedCardDetails}
                            </Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {customCardName}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        {!isAssigned && (
                            <Button
                                small
                                success
                                text={translate('workspace.companyCards.assign')}
                                onPress={handleRowPress}
                                isDisabled={isAssigningCardDisabled}
                            />
                        )}

                        <Icon
                            src={Expensicons.ArrowRight}
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

export default WorkspaceCompanyCardTableRow;
export type {WorkspaceCompanyCardTableRowData as WorkspaceCompanyCardTableItemData};
