import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSpendRuleFormValuesFromCardRule} from '@libs/actions/Card';
import {filterInactiveCards, getCardDescriptionForSearchTable, isCard} from '@libs/CardUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SpendRuleForm} from '@src/types/form';
import type {WorkspaceCardsList} from '@src/types/onyx';

type SpendRulesSectionProps = {
    policyID: string;
};

type SpendRuleSummaryPart = {
    badgeLabel: string;
    text: string;
    isNeutral?: boolean;
};

function getSpendRuleSummaryParts(
    formValues: SpendRuleForm,
    selectedCurrency: string | undefined,
    actionLabel: string,
    translate: ReturnType<typeof useLocalize>['translate'],
): SpendRuleSummaryPart[] {
    const summaryParts: SpendRuleSummaryPart[] = [];
    const merchantNames = formValues.merchantNames.filter(Boolean).join(', ');
    const categories = formValues.categories.map((category) => getDecodedCategoryName(category)).join(', ');
    const maxAmount = formValues.maxAmount.trim();

    if (merchantNames) {
        summaryParts.push({badgeLabel: actionLabel, text: `${translate('workspace.rules.spendRules.merchants')}: ${merchantNames}`});
    }

    if (categories) {
        summaryParts.push({badgeLabel: actionLabel, text: `${translate('workspace.rules.spendRules.categories')}: ${categories}`});
    }

    if (maxAmount) {
        summaryParts.push({
            badgeLabel: translate('workspace.rules.spendRules.max'),
            text: `${translate('iou.amount')}: ${convertToDisplayString(convertToBackendAmount(Number.parseFloat(maxAmount)), selectedCurrency ?? CONST.CURRENCY.USD)}`,
            isNeutral: true,
        });
    }

    return summaryParts;
}

function getSelectedCardsCurrency(cardIDs: string[], cardsList: WorkspaceCardsList | undefined): string | undefined {
    const currencies = new Set<string>();

    for (const cardID of cardIDs) {
        const card = cardsList?.[cardID];
        if (!card || !isCard(card)) {
            continue;
        }

        if (typeof card.nameValuePairs?.currency === 'string' && card.nameValuePairs.currency) {
            currencies.add(String(card.nameValuePairs.currency));
        }
    }

    if (currencies.size !== 1) {
        return undefined;
    }

    return Array.from(currencies).at(0);
}

function SpendRulesSection({policyID}: SpendRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Plus']);
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardProtectionIllustration']);
    const {isProduction} = useEnvironment();
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const showBuiltInProtectionModal = () => {
        showConfirmModal({
            image: illustrations.ExpensifyCardProtectionIllustration,
            imageStyles: [styles.w100],
            shouldFitImageToContainer: true,
            title: translate('workspace.rules.spendRules.builtInProtectionModal.title'),
            titleStyles: [styles.textHeadlineH1],
            titleContainerStyles: [styles.mb3],
            prompt: translate('workspace.rules.spendRules.builtInProtectionModal.description'),
            promptStyles: [styles.mb1],
            shouldShowCancelButton: false,
            success: false,
            confirmText: translate('common.buttonConfirm'),
            innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.builtInProtectionModalWidth),
        });
    };

    const defaultRuleTitle = translate('workspace.rules.spendRules.defaultRuleTitle');
    const descriptionLabel = translate('workspace.rules.spendRules.defaultRuleDescription');
    const blockLabel = translate('workspace.rules.spendRules.block');
    const allowLabel = translate('workspace.rules.spendRules.allow');
    const createdRules = Object.entries(expensifyCardSettings?.cardRules ?? {})
        .map(([ruleID, cardRule]) => {
            const formValues = getSpendRuleFormValuesFromCardRule(cardRule);
            if (!formValues) {
                return undefined;
            }
            const actionLabel = formValues.restrictionAction === CONST.SPEND_CARD_RULE.ACTION.BLOCK ? blockLabel : allowLabel;
            const selectedCurrency = getSelectedCardsCurrency(formValues.cardIDs, cardsList);

            const cardSummary = formValues.cardIDs
                .map((cardID) => {
                    const card = cardsList?.[cardID];
                    if (!card || !isCard(card)) {
                        return cardID;
                    }

                    const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                    return getCardDescriptionForSearchTable(card, displayName || undefined) || cardID;
                })
                .join(', ');

            return {
                ruleID,
                actionLabel,
                cardSummary,
                summaryParts: getSpendRuleSummaryParts(formValues, selectedCurrency, actionLabel, translate),
                isBlock: formValues.restrictionAction === CONST.SPEND_CARD_RULE.ACTION.BLOCK,
            };
        })
        .filter((rule) => rule !== undefined);

    const renderSectionTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.spendRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    const menuItemBody = (
        <View>
            <View style={[styles.flexRow, styles.gap2, styles.alignItemsStart]}>
                <Badge
                    text={blockLabel}
                    badgeStyles={[styles.ml0]}
                    error
                    isCondensed
                />
                <Text
                    style={[styles.flex1, styles.flexShrink1, styles.themeTextColor]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {defaultRuleTitle}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.mt2]}>
                <Icon
                    src={expensifyIcons.Lock}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
                <Text
                    style={[styles.flex1, styles.textLabelSupporting, styles.fontSizeLabel]}
                    numberOfLines={2}
                >
                    {descriptionLabel}
                </Text>
            </View>
        </View>
    );

    return (
        <Section
            renderTitle={renderSectionTitle}
            subtitle={translate('workspace.rules.spendRules.subtitle')}
            isCentralPane
            subtitleMuted
        >
            <MenuItem
                wrapperStyle={[styles.borderedContentCard, styles.mt6, styles.ph4, styles.pv4]}
                titleComponent={menuItemBody}
                accessibilityLabel={`${descriptionLabel}. ${blockLabel} ${defaultRuleTitle}`}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                onPress={showBuiltInProtectionModal}
                shouldShowRightIcon
            />
            {createdRules.map((rule) => (
                <MenuItem
                    key={rule.ruleID}
                    wrapperStyle={[styles.borderedContentCard, styles.mt2, styles.ph4, styles.pv4]}
                    titleComponent={
                        <View>
                            {rule.summaryParts.map((part) => (
                                <View
                                    key={part.text}
                                    style={[styles.flexRow, styles.gap2, styles.alignItemsStart, styles.mb2]}
                                >
                                    <Badge
                                        text={part.badgeLabel}
                                        badgeStyles={[styles.ml0, styles.justifyContentCenter]}
                                        error={!part.isNeutral && rule.isBlock}
                                        success={!part.isNeutral && !rule.isBlock}
                                        isCondensed
                                    />
                                    <Text
                                        style={[styles.flex1, styles.flexShrink1, styles.themeTextColor]}
                                        numberOfLines={2}
                                    >
                                        {part.text}
                                    </Text>
                                </View>
                            ))}
                            <Text
                                style={[styles.textLabelSupporting, styles.fontSizeLabel]}
                                numberOfLines={2}
                            >
                                {rule.cardSummary}
                            </Text>
                        </View>
                    }
                    accessibilityLabel={`${rule.summaryParts.map((part) => `${part.badgeLabel}. ${part.text}`).join('. ')}. ${rule.cardSummary}`}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                    interactive={false}
                />
            ))}
            {!isProduction && (
                <MenuItem
                    title={translate('workspace.rules.spendRules.addSpendRule')}
                    titleStyle={styles.textStrong}
                    icon={expensifyIcons.Plus}
                    iconHeight={20}
                    iconWidth={20}
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID))}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_SPEND_RULE}
                />
            )}
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
