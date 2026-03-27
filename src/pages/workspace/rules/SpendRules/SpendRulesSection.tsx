import React, {useMemo} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SpendRulesSectionProps = {
    policyID: string;
};

function SpendRulesSection({policyID}: SpendRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    // const policy = usePolicy(policyID);
    // const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    // // Hoist iterator-independent translations to avoid redundant calls in the loop
    // const fieldLabels: FieldLabels = useMemo(
    //     () => ({
    //         category: translate('common.category').toLowerCase(),
    //         tag: translate('common.tag').toLowerCase(),
    //         description: translate('common.description').toLowerCase(),
    //         tax: translate('common.tax').toLowerCase(),
    //     }),
    //     [translate],
    // );

    // const codingRules = policy?.rules?.codingRules;
    // const hasRules = !isEmptyObject(codingRules);

    // const sortedRules = useMemo(() => {
    //     if (!codingRules) {
    //         return [];
    //     }

    //     return Object.entries(codingRules)
    //         .filter(([, rule]) => !!rule)
    //         .map(([ruleID, rule]) => ({...rule, ruleID}))
    //         .sort((a, b) => {
    //             if (a.created && b.created) {
    //                 return a.created < b.created ? 1 : -1;
    //             }
    //             return 0;
    //         });
    // }, [codingRules]);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.merchantRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            subtitle={translate('workspace.rules.merchantRules.subtitle')}
            subtitleMuted
        >
    //         {hasRules && (
    //             <View style={[styles.mt3]}>
    //                 {sortedRules.map((rule) => {
    //                     const merchantName = rule.filters?.right ?? '';
    //                     const isExactMatch = rule.filters?.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;
    //                     const matchDescription = translate('workspace.rules.merchantRules.ruleSummaryTitle', merchantName, isExactMatch);
    //                     // const ruleDescription = getRuleDescription(rule, translate, fieldLabels);

    //                     return (
    //                         <View key={rule.ruleID}>
    //                             <OfflineWithFeedback
    //                                 pendingAction={rule.pendingAction}
    //                                 errors={rule.errors}
    //                             >
    //                                 <MenuItemWithTopDescription
    //                                     description={matchDescription}
    //                                     title={'Test Rule'}
    //                                     wrapperStyle={[styles.sectionMenuItemTopDescription]}
    //                                     descriptionTextStyle={[styles.textSupportingNormal, styles.textStrong, styles.themeTextColor]}
    //                                     titleStyle={[styles.textLabelSupporting, styles.fontSizeLabel]}
    //                                     shouldShowRightIcon
    //                                     onPress={() => Navigation.navigate(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, rule.ruleID))}
    //                                     sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_ITEM}
    //                                     disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
    //                                 />
    //                             </OfflineWithFeedback>
    //                         </View>
    //                     );
    //                 })}
    //             </View>
    //         )}
    //         <MenuItem
    //             title={translate('workspace.rules.merchantRules.addRule')}
    //             titleStyle={styles.textStrong}
    //             icon={expensifyIcons.Plus}
    //             iconHeight={20}
    //             iconWidth={20}
    //             style={[styles.sectionMenuItemTopDescription, !hasRules && styles.mt6, styles.mbn3]}
    //             onPress={() => Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID))}
    //             sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_MERCHANT_RULE}
    //         />
        </Section>
    );
}

SpendRulesSection.displayName = 'SpendRulesSection';

export default SpendRulesSection;
