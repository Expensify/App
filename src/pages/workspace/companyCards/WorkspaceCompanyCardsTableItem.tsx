import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetFailedWorkspaceCompanyCardAssignment} from '@libs/actions/CompanyCards';
import {getCardFeedIcon, getCompanyCardFeedWithDomainID, lastFourNumbersFromCardName, splitMaskedCardNumber} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID, FailedCompanyCardAssignment, PersonalDetails} from '@src/types/onyx';

type WorkspaceCompanyCardTableItemData = {
    /** Card number */
    cardName: string;

    /** Card name */
    customCardName?: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Assigned card */
    assignedCard: Card | undefined;

    /** Pending company card assignment */
    failedCompanyCardAssignment: FailedCompanyCardAssignment | undefined;

    /** Whether the card is deleted */
    isCardDeleted: boolean;

    /** Whether the card is assigned */
    isAssigned: boolean;
};

type WorkspaceCompanyCardTableItemProps = {
    /** The workspace company card table item */
    item: WorkspaceCompanyCardTableItemData;

    /** Policy ID */
    policyID: string;

    /** Domain or workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** Selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** Plaid URL */
    plaidIconUrl?: string;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether the card is a Plaid card feed */
    isPlaidCardFeed: boolean;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableRowLayout?: boolean;

    /** Number of columns in the table */
    columnCount: number;

    /** On assign card callback */
    onAssignCard: (cardID?: string) => void;
};

function WorkspaceCompanyCardTableItem({
    item,
    policyID,
    domainOrWorkspaceAccountID,
    selectedFeed,
    plaidIconUrl,
    isPlaidCardFeed,
    shouldUseNarrowTableRowLayout,
    columnCount,
    isAssigningCardDisabled,
    onAssignCard,
}: WorkspaceCompanyCardTableItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const cardFeedIcon = !plaidIconUrl && getCardFeedIcon(selectedFeed as CompanyCardFeed, illustrations, companyCardFeedIcons);

    const {failedCompanyCardAssignment} = item;
    let {cardName, customCardName, cardholder, assignedCard, isAssigned, isCardDeleted} = item;
    let errors = assignedCard?.errors;
    let pendingAction = assignedCard?.pendingAction;

    if (failedCompanyCardAssignment) {
        cardName = failedCompanyCardAssignment.cardNumber;
        customCardName = failedCompanyCardAssignment.cardName;
        cardholder = failedCompanyCardAssignment.cardholder;
        assignedCard = undefined;
        isAssigned = true;
        isCardDeleted = false;
        errors = failedCompanyCardAssignment?.errors;
        pendingAction = failedCompanyCardAssignment?.pendingAction;
    }

    const lastCardNumbers = isPlaidCardFeed ? lastFourNumbersFromCardName(cardName) : splitMaskedCardNumber(cardName)?.lastDigits;

    const alternateLoginText = shouldUseNarrowTableRowLayout ? `${customCardName}${lastCardNumbers ? ` - ${lastCardNumbers}` : ''}` : (cardholder?.login ?? '');

    const resetFailedCompanyCardAssignment = () => {
        if (!failedCompanyCardAssignment) {
            return;
        }

        resetFailedWorkspaceCompanyCardAssignment(domainOrWorkspaceAccountID, cardName);
    };

    const assignCard = () => onAssignCard(cardName);

    return (
        <OfflineWithFeedback
            errorRowStyles={styles.ph5}
            errors={errors}
            pendingAction={pendingAction}
            onClose={resetFailedCompanyCardAssignment}
        >
            <PressableWithFeedback
                role={CONST.ROLE.BUTTON}
                style={[styles.mh5, styles.br3, styles.mb2, styles.highlightBG]}
                accessibilityLabel="row"
                hoverStyle={styles.hoveredComponentBG}
                disabled={isCardDeleted}
                onPress={() => {
                    if (!assignedCard) {
                        assignCard();
                        return;
                    }

                    if (!assignedCard?.accountID || !assignedCard?.fundID) {
                        return;
                    }

                    return Navigation.navigate(
                        ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(
                            policyID,
                            assignedCard.cardID.toString(),
                            getCompanyCardFeedWithDomainID(assignedCard?.bank as CompanyCardFeed, assignedCard.fundID),
                        ),
                    );
                }}
            >
                {({hovered}) => (
                    <View
                        style={[
                            styles.br3,
                            styles.p4,
                            styles.gap3,
                            styles.dFlex,
                            styles.flexRow,
                            styles.alignItemsCenter,
                            // Use Grid on web when available (will override flex if supported)
                            !shouldUseNarrowTableRowLayout && [styles.dGrid, {gridTemplateColumns: `repeat(${columnCount}, 1fr)`}],
                        ]}
                    >
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            {isAssigned ? (
                                <>
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

                                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                        <TextWithTooltip
                                            text={cardholder?.displayName ?? ''}
                                            style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.justifyContentCenter]}
                                        />
                                        <TextWithTooltip
                                            text={alternateLoginText}
                                            style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    {!!plaidIconUrl && <PlaidCardFeedIcon plaidUrl={plaidIconUrl} />}

                                    {!plaidIconUrl && !!cardFeedIcon && (
                                        <Icon
                                            src={cardFeedIcon}
                                            height={variables.cardIconHeight}
                                            width={variables.cardIconWidth}
                                            additionalStyles={styles.cardIcon}
                                        />
                                    )}

                                    <Text
                                        numberOfLines={1}
                                        style={[styles.optionDisplayName, styles.textStrong, styles.pre]}
                                    >
                                        {translate('workspace.moreFeatures.companyCards.unassignedCards')}
                                    </Text>
                                </>
                            )}
                        </View>

                        {!shouldUseNarrowTableRowLayout && (
                            <View style={[styles.flex1]}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                >
                                    {cardName}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.flex1, styles.alignItemsEnd]}>
                            {isAssigned && (
                                <View style={[styles.justifyContentEnd, styles.w100, styles.flexRow, styles.ml2, styles.gap3]}>
                                    {!shouldUseNarrowTableRowLayout && (
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
                            )}
                            {!isAssigned && (
                                <Button
                                    success
                                    text={shouldUseNarrowTableRowLayout ? translate('workspace.companyCards.assign') : translate('workspace.companyCards.assignCard')}
                                    onPress={assignCard}
                                    isDisabled={isAssigningCardDisabled}
                                />
                            )}
                        </View>
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default WorkspaceCompanyCardTableItem;
export type {WorkspaceCompanyCardTableItemData};
