import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDefaultName} from '@libs/actions/Card';
import {getCardFeedIcon, lastFourNumbersFromCardName} from '@libs/CardUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID, PersonalDetails} from '@src/types/onyx';

type WorkspaceCompanyCardsListRowProps = {
    /** Selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** Card number */
    cardName: string;

    /** Card name */
    customCardName?: string;

    /** Plaid URL */
    plaidIconUrl?: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Whether the list item is hovered */
    isHovered?: boolean;

    /** Whether the card is assigned */
    isAssigned: boolean;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableRowLayout?: boolean;

    /** On assign card callback */
    onAssignCard: () => void;
};

function WorkspaceCompanyCardsListRow({
    selectedFeed,
    cardholder,
    customCardName,
    cardName,
    isHovered,
    isAssigned,
    onAssignCard,
    plaidIconUrl,
    isAssigningCardDisabled,
    shouldUseNarrowTableRowLayout,
}: WorkspaceCompanyCardsListRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight'] as const);

    const customCardNameWithFallback = customCardName ?? getCardDefaultName(cardholder?.displayName);

    let cardFeedIcon = null;
    if (!plaidIconUrl) {
        cardFeedIcon = getCardFeedIcon(selectedFeed as CompanyCardFeed, illustrations, companyCardFeedIcons);
    }

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
                {!isAssigned && (
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

export default WorkspaceCompanyCardsListRow;
