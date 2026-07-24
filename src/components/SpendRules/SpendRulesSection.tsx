import ActivityIndicator from '@components/ActivityIndicator';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SearchBar from '@components/SearchBar';
import Section from '@components/Section';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardRules from '@hooks/useExpensifyCardRulesList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {TupleToUnion} from 'type-fest';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type SpendRulesSectionProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function SpendRulesSection({policyID, canWriteRules, showReadOnlyModal}: SpendRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock', 'Plus']);
    const {showConfirmModal} = useConfirmModal();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardProtectionIllustration']);
    const {isOffline} = useNetwork();
    const defaultFundID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const {cardRules, isLoadingCardRules} = useExpensifyCardRules(policyID);

    const filterCardRules = (cardRule: TupleToUnion<typeof cardRules>, searchInput: string) => {
        const results = tokenizedSearch([cardRule], searchInput, (option) => option.searchTokens);
        return results.length > 0;
    };

    const [inputValue, setInputValue, filteredCardRules] = useSearchResults(cardRules, filterCardRules);

    useEffect(() => {
        if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }
        if (expensifyCardSettings?.isLoading) {
            return;
        }
        if (expensifyCardSettings?.hasOnceLoaded) {
            return;
        }

        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [defaultFundID, expensifyCardSettings?.hasOnceLoaded, expensifyCardSettings?.isLoading, policyID]);

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
            innerContainerStyle: shouldUseNarrowLayout ? undefined : StyleUtils.getWidthStyle(variables.wideConfirmModalWidth),
        });
    };

    const blockLabel = translate('workspace.rules.spendRules.block');
    const defaultRuleTitle = translate('workspace.rules.spendRules.defaultRuleTitle');
    const descriptionLabel = translate('workspace.rules.spendRules.defaultRuleDescription');

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
            {cardRules.length >= CONST.STANDARD_LIST_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.card.searchRules')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={!isLoadingCardRules && filteredCardRules.length === 0}
                    style={[styles.mb0, styles.mt5, styles.mh0]}
                />
            )}
            <MenuItem
                wrapperStyle={[styles.borderedContentCard, styles.mt5, styles.ph4, styles.pv4]}
                titleComponent={menuItemBody}
                accessibilityLabel={`${descriptionLabel}. ${blockLabel} ${defaultRuleTitle}`}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                onPress={showBuiltInProtectionModal}
                shouldShowRightIcon
            />
            {isLoadingCardRules ? (
                <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.mt5, styles.mb3]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={{
                            context: 'SpendRulesSection',
                            isOffline,
                            hasOnceLoaded: false,
                        }}
                    />
                </View>
            ) : (
                filteredCardRules.map((rule) => (
                    <OfflineWithFeedback
                        key={rule.ruleID}
                        pendingAction={rule.pendingAction}
                    >
                        <MenuItem
                            accessibilityLabel={rule.accessibilityLabel}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_ITEM}
                            shouldShowRightIcon
                            disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_EDIT.getRoute(policyID, rule.ruleID))}
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
                                                error={part.variant === CONST.SPEND_RULES.BADGE_VARIANTS.ERROR}
                                                success={part.variant === CONST.SPEND_RULES.BADGE_VARIANTS.SUCCESS}
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
                        />
                    </OfflineWithFeedback>
                ))
            )}
            <MenuItem
                title={translate('workspace.rules.spendRules.addSpendRule')}
                titleStyle={styles.textStrong}
                icon={expensifyIcons.Plus}
                iconHeight={20}
                iconWidth={20}
                style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3, !canWriteRules && styles.buttonOpacityDisabled]}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_SPEND_RULE}
                onPress={() => {
                    if (!canWriteRules) {
                        showReadOnlyModal();
                        return;
                    }
                    Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
                }}
            />
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
