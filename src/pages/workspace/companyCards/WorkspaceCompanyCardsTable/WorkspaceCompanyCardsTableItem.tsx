import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedWithDomainID, lastFourNumbersFromCardName, splitMaskedCardNumber} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardAssignmentData} from '@src/types/onyx/Card';

type WorkspaceCompanyCardTableItemData = CardAssignmentData & {
    /** Whether the card is deleted */
    isCardDeleted: boolean;

    /** Whether the card is assigned */
    isAssigned: boolean;

    /** Assigned card */
    assignedCard?: Card;

    /** On dismiss error callback */
    onDismissError?: () => void;
};

type WorkspaceCompanyCardTableItemProps = {
    /** The workspace company card table item */
    item: WorkspaceCompanyCardTableItemData;

    /** Policy ID */
    policyID: string;

    /** Card feed icon element */
    CardFeedIcon?: React.ReactNode;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether the card is a Plaid card feed */
    isPlaidCardFeed: boolean;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Number of columns in the table */
    columnCount: number;

    /**
     * Callback when assigning a card.
     * @param cardName - The masked card number displayed to users
     * @param cardID - The identifier sent to backend (equals cardName for direct feeds)
     */
    onAssignCard: (cardName: string, cardID: string) => void;
};

function WorkspaceCompanyCardTableItem({
    item,
    policyID,
    CardFeedIcon,
    isPlaidCardFeed,
    shouldUseNarrowTableLayout,
    columnCount,
    isAssigningCardDisabled,
    onAssignCard,
}: WorkspaceCompanyCardTableItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {isOffline} = useNetwork();

    const {cardName, encryptedCardNumber, customCardName, cardholder, assignedCard, isAssigned, isCardDeleted, errors, pendingAction, onDismissError} = item;

    const lastCardNumbers = isPlaidCardFeed ? lastFourNumbersFromCardName(cardName) : splitMaskedCardNumber(cardName)?.lastDigits;
    const cardholderLoginText = !shouldUseNarrowTableLayout && isAssigned ? Str.removeSMSDomain(cardholder?.login ?? '') : undefined;
    const narrowWidthCardName = isAssigned ? `${customCardName ?? ''}${lastCardNumbers ? ` - ${lastCardNumbers}` : ''}` : cardName;

    const leftColumnTitle = isAssigned ? Str.removeSMSDomain(cardholder?.displayName ?? '') : translate('workspace.moreFeatures.companyCards.unassignedCards');
    const leftColumnSubtitle = shouldUseNarrowTableLayout ? narrowWidthCardName : cardholderLoginText;

    const assignCard = () => onAssignCard(cardName, encryptedCardNumber);
    const isDeleting = !isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    return (
        <OfflineWithFeedback
            errorRowStyles={[styles.ph5, styles.mb4]}
            errors={errors}
            pendingAction={pendingAction}
            onClose={onDismissError}
            shouldHideOnDelete={false}
        >
            {isDeleting ? (
                <View style={[styles.mh5, styles.flexRow, styles.br3, styles.mb2, styles.highlightBG, styles.overflowHidden]}>
                    <TableRowSkeleton
                        fixedNumItems={1}
                        useCompanyCardsLayout
                    />
                </View>
            ) : (
                <PressableWithFeedback
                    role={isAssigned ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
                    style={[styles.mh5, styles.flexRow, styles.br3, styles.mb2, styles.highlightBG, styles.overflowHidden]}
                    accessibilityLabel="row"
                    hoverStyle={isAssigned && styles.hoveredComponentBG}
                    disabled={isCardDeleted}
                    interactive={isAssigned}
                    pressDimmingValue={isAssigned ? undefined : 1}
                    onPress={() => {
                        if (!assignedCard) {
                            assignCard();
                            return;
                        }

                        if (!assignedCard?.accountID || !assignedCard?.fundID) {
                            return;
                        }

                        const feedName = getCardFeedWithDomainID(assignedCard?.bank as CompanyCardFeed, assignedCard.fundID);

                        return Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, feedName as CompanyCardFeedWithDomainID, assignedCard.cardID.toString()));
                    }}
                >
                    {({hovered}) => (
                        <View
                            style={[
                                styles.flex1,
                                styles.flexRow,
                                styles.alignItemsCenter,
                                styles.p4,
                                styles.gap3,
                                styles.dFlex,
                                // Use Grid on web when available (will override flex if supported)
                                !shouldUseNarrowTableLayout && [styles.dGrid, {gridTemplateColumns: `repeat(${columnCount}, 1fr)`}],
                            ]}
                        >
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                {isAssigned ? (
                                    <Avatar
                                        source={
                                            cardholder?.avatar ??
                                            getDefaultAvatarURL({
                                                accountID: cardholder?.accountID,
                                            })
                                        }
                                        avatarID={cardholder?.accountID}
                                        type={CONST.ICON_TYPE_AVATAR}
                                        size={CONST.AVATAR_SIZE.DEFAULT}
                                    />
                                ) : (
                                    CardFeedIcon
                                )}

                                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                    <TextWithTooltip
                                        text={leftColumnTitle}
                                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.justifyContentCenter, !isAssigned && styles.cursorText]}
                                    />
                                    {!!leftColumnSubtitle && (
                                        <TextWithTooltip
                                            text={leftColumnSubtitle}
                                            style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.mr3, !isAssigned && styles.cursorText]}
                                        />
                                    )}
                                </View>
                            </View>

                            {!shouldUseNarrowTableLayout && (
                                <View style={[styles.flex1]}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre, !isAssigned && styles.cursorText]}
                                    >
                                        {cardName}
                                    </Text>
                                </View>
                            )}

                            <View style={[styles.flexRow, styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
                                {isAssigned ? (
                                    <View style={[styles.flexRow, styles.ml2, styles.gap3, styles.mw100]}>
                                        {!shouldUseNarrowTableLayout && (
                                            <Text
                                                numberOfLines={1}
                                                style={[styles.optionDisplayName, styles.pre]}
                                            >
                                                {customCardName}
                                            </Text>
                                        )}
                                        <Icon
                                            src={Expensicons.ArrowRight}
                                            fill={theme.icon}
                                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                            medium
                                            isButtonIcon
                                        />
                                    </View>
                                ) : (
                                    <Button
                                        success
                                        small={shouldUseNarrowTableLayout}
                                        text={shouldUseNarrowTableLayout ? translate('workspace.companyCards.assign') : translate('workspace.companyCards.assignCard')}
                                        onPress={assignCard}
                                        isDisabled={isAssigningCardDisabled}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </PressableWithFeedback>
            )}
        </OfflineWithFeedback>
    );
}

export default WorkspaceCompanyCardTableItem;
export type {WorkspaceCompanyCardTableItemData};
