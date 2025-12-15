import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDefaultName} from '@libs/actions/Card';
import {lastFourNumbersFromCardName} from '@libs/CardUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type WorkspaceCompanyCardsListRowProps = {
    /** Card number */
    cardName: string;

    /** Card name */
    customCardName?: string;

    plaidUrl?: string;

    /** Card feed icon */
    cardFeedIcon: IconAsset;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Whether the list item is hovered */
    isHovered?: boolean;

    /** Whether the card is assigned */
    isAssigned: boolean;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether to show assign card button */
    shouldShowAssignCardButton?: boolean;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableRowLayout?: boolean;

    /** On assign card */
    onAssignCard: () => void;
};

function WorkspaceCompanyCardsListRow({
    cardholder,
    customCardName,
    cardName,
    isHovered,
    isAssigned,
    onAssignCard,
    plaidUrl,
    cardFeedIcon,
    isAssigningCardDisabled,
    shouldShowAssignCardButton,
    shouldUseNarrowTableRowLayout,
}: WorkspaceCompanyCardsListRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const customCardNameWithFallback = customCardName ?? getCardDefaultName(cardholder?.displayName);

    const lastFourCardNameNumbers = lastFourNumbersFromCardName(cardName);

    const alternateLoginText = shouldUseNarrowTableRowLayout ? `${customCardNameWithFallback} - ${lastFourCardNameNumbers}` : (cardholder?.login ?? '');

    return (
        <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.br3, styles.p4]}>
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
                        {plaidUrl ? (
                            <PlaidCardFeedIcon plaidUrl={plaidUrl} />
                        ) : (
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
                            Unassigned
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

            <View style={[!shouldUseNarrowTableRowLayout && styles.flex1, styles.alignItemsEnd]}>
                {isAssigned && (
                    <View style={[styles.justifyContentCenter, styles.flexRow, styles.alignItemsCenter, styles.ml2, styles.gap3]}>
                        {!shouldUseNarrowTableRowLayout && (
                            <Text
                                numberOfLines={1}
                                style={[styles.optionDisplayName, styles.pre]}
                            >
                                {customCardNameWithFallback}
                            </Text>
                        )}
                        <Icon
                            src={Expensicons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                            medium
                            isButtonIcon
                        />
                    </View>
                )}
                {!isAssigned && !!shouldShowAssignCardButton && (
                    <Button
                        text={shouldUseNarrowTableRowLayout ? translate('workspace.companyCards.assign') : translate('workspace.companyCards.assignCard')}
                        onPress={onAssignCard}
                        isDisabled={isAssigningCardDisabled}
                    />
                )}
            </View>
        </View>
    );
}

WorkspaceCompanyCardsListRow.displayName = 'WorkspaceCompanyCardsListRow';

export default WorkspaceCompanyCardsListRow;
