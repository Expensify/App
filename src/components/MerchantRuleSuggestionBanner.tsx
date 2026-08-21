import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissMerchantRuleSuggestion} from '@libs/actions/MerchantRuleSuggestion';
import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import Banner from './Banner';
import Text from './Text';
import TextLink from './TextLink';

type MerchantRuleSuggestionBannerProps = {
    /** The report hosting the expense detail view: a transaction thread or its parent expense report */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;

    /** Styles for the banner container */
    containerStyles?: StyleProp<ViewStyle>;
};

/**
 * Offers a workspace admin the chance to turn an expense edit into a merchant rule, right on the expense they just
 * edited. Renders nothing unless there is a qualifying edit to act on.
 */
function MerchantRuleSuggestionBanner({reportID, policyID, containerStyles}: MerchantRuleSuggestionBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID);

    if (!suggestion || !transaction || !policyID) {
        return null;
    }

    const createRule = () => {
        const draft = getMerchantRuleDraftFromTransaction(transaction, suggestion.field, policy);
        if (!draft) {
            return;
        }
        // Seed the draft the rule editor reads, then open the same flow used from workspace settings
        setDraftMerchantRule(draft);
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID, undefined, Navigation.getActiveRoute()));
    };

    return (
        <Banner
            containerStyles={[styles.chatFooterBanner, styles.p4, containerStyles]}
            icon={icons.Lightbulb}
            shouldShowIcon
            shouldShowCloseButton
            onClose={() => dismissMerchantRuleSuggestion(suggestion.transactionID)}
            content={
                <Text style={[styles.flex1, styles.flexWrap, styles.textNormal, styles.mr3]}>
                    <TextLink
                        style={[styles.textStrong, styles.link]}
                        onPress={createRule}
                    >
                        {translate('workspace.rules.merchantRules.createRuleFromExpenseAction')}
                    </TextLink>
                    {` ${translate('workspace.rules.merchantRules.createRuleFromExpensePrompt')}`}
                </Text>
            }
        />
    );
}

MerchantRuleSuggestionBanner.displayName = 'MerchantRuleSuggestionBanner';

export default MerchantRuleSuggestionBanner;
