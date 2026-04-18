import React, {useEffect} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSpendRuleFormValuesFromCardRule} from '@libs/actions/Card';
import {openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import {filterInactiveCards, getCardDescriptionForSearchTable, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SpendRuleForm} from '@src/types/form';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getTruncatedSpendRuleSummary} from './SpendRulesUtils';

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
    convertToDisplayString: ReturnType<typeof useCurrencyListActions>['convertToDisplayString'],
): SpendRuleSummaryPart[] {
    const summaryParts: SpendRuleSummaryPart[] = [];
    const merchantNames = getTruncatedSpendRuleSummary(formValues.merchantNames, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    const categories = getTruncatedSpendRuleSummary(
        formValues.categories.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
        (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
    );
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

function SpendRulesSection({policyID}: SpendRulesSectionProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Plus']);
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardProtectionIllustration']);
    const {isProduction} = useEnvironment();
    const {isOffline} = useNetwork();
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardsList, cardsListResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    useEffect(() => {
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [policyID, defaultFundID]);

    const isSpendRulesListLoading = !isOffline && (isLoadingOnyxValue(cardsListResult) || !expensifyCardSettings || expensifyCardSettings.isLoading) && !expensifyCardSettings?.hasOnceLoaded;

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
            const actionLabel = formValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK ? blockLabel : allowLabel;
            const activeCardIDs = formValues.cardIDs.filter((cardID) => !!cardsList?.[cardID]);
            if (activeCardIDs.length === 0) {
                return undefined;
            }
            const selectedCurrency = getSelectedCardsSharedCurrency(activeCardIDs, cardsList);
            const cardSummary = getTruncatedSpendRuleSummary(
                activeCardIDs.map((cardID) => {
                    const card = cardsList?.[cardID];
                    if (!card) {
                        return cardID;
                    }

                    const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                    return getCardDescriptionForSearchTable(card, translate, displayName || undefined) || cardID;
                }),
                (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
            );

            return {
                ruleID,
                actionLabel,
                cardSummary,
                summaryParts: getSpendRuleSummaryParts(formValues, selectedCurrency, actionLabel, translate, convertToDisplayString),
                isBlock: formValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK,
                created: cardRule.created,
                pendingAction: cardRule.pendingAction,
            };
        })
        .filter((rule): rule is NonNullable<typeof rule> => rule !== undefined && (isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE))
        .sort((a, b) => localeCompare(a.created, b.created));

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
                    badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
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
            {isSpendRulesListLoading ? (
                <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.mt5, styles.mb3]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={{
                            context: 'SpendRulesSection',
                            isOffline,
                            hasOnceLoaded: !isSpendRulesListLoading,
                        }}
                    />
                </View>
            ) : (
                createdRules.map((rule) => (
                    <OfflineWithFeedback
                        key={rule.ruleID}
                        pendingAction={rule.pendingAction}
                    >
                        <MenuItem
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
                                                badgeStyles={[styles.ml0, styles.justifyContentCenter, StyleUtils.getMinimumWidth(40)]}
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
                            shouldShowRightIcon
                            disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_EDIT.getRoute(policyID, rule.ruleID))}
                        />
                    </OfflineWithFeedback>
                ))
            )}
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
