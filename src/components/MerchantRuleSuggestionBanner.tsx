import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion, setIsCreatingMerchantRule} from '@libs/actions/MerchantRuleSuggestion';
import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import Banner from './Banner';
import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';

type MerchantRuleSuggestionBannerProps = {
    /** The report hosting the expense detail view: a transaction thread, its expense report, or the chat it lives in */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;

    /** The expense being displayed, when the host already knows it */
    transactionID?: string;

    /** Styles for the banner container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Pins the callout over the top of the scroll area instead of laying it out inline */
    shouldOverlayScrollArea?: boolean;
};

function MerchantRuleSuggestionBannerContent({reportID, policyID, transactionID, containerStyles, shouldOverlayScrollArea}: MerchantRuleSuggestionBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID, transactionID);

    // The offer is about the edit the user just made, so it ends once they have seen it and navigated away. Retiring
    // rather than dismissing leaves the expense itself untouched: returning to it shows nothing, but editing it again
    // offers afresh. Only the close button silences an expense for the session.
    const hasBeenShownRef = useRef(false);
    useEffect(() => {
        if (!suggestion) {
            return;
        }
        hasBeenShownRef.current = true;
    }, [suggestion]);
    useEffect(
        () => () => {
            if (!hasBeenShownRef.current) {
                return;
            }
            retireMerchantRuleSuggestion();
        },
        [],
    );

    if (!suggestion || !policyID) {
        return null;
    }

    const createRule = () => {
        const draft = getMerchantRuleDraftFromTransaction(transaction, suggestion.field, policy);
        if (!draft) {
            return;
        }
        // Seed the draft the rule editor reads, then open the same flow used from workspace settings
        setDraftMerchantRule(draft);
        // Tells that flow it was entered from an expense, so saving returns here rather than to the Rules page
        setIsCreatingMerchantRule(true);
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const banner = (
        <Banner
            containerStyles={[styles.merchantRuleCalloutContainer, styles.p4, containerStyles]}
            shouldShowCloseButton
            onClose={dismissMerchantRuleSuggestion}
            content={
                <>
                    <View style={styles.mr3}>
                        <Icon
                            src={icons.Lightbulb}
                            fill={theme.tooltipHighlightText}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                    <Text style={[styles.flex1, styles.flexWrap, styles.merchantRuleCalloutText, styles.mr3]}>
                        <TextLink
                            style={styles.merchantRuleCalloutAction}
                            onPress={createRule}
                        >
                            {translate('workspace.rules.merchantRules.createRuleFromExpenseAction')}
                        </TextLink>
                        {` ${translate('workspace.rules.merchantRules.createRuleFromExpensePrompt')}`}
                    </Text>
                </>
            }
        />
    );

    if (!shouldOverlayScrollArea) {
        return banner;
    }

    return <View style={styles.merchantRuleCalloutOverlay}>{banner}</View>;
}

MerchantRuleSuggestionBannerContent.displayName = 'MerchantRuleSuggestionBannerContent';

/**
 * Offers a workspace admin the chance to turn an expense edit into a merchant rule, right on the expense they just
 * edited. Renders nothing unless there is a qualifying edit to act on.
 */
function MerchantRuleSuggestionBanner({reportID, policyID, transactionID, containerStyles, shouldOverlayScrollArea}: MerchantRuleSuggestionBannerProps) {
    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);

    // Nothing is stored for most of a session, so skip the inner component (and its heavy hooks, which subscribe to the
    // policy, its categories, the transaction and the report's transactions) until an edit is waiting to be offered.
    if (!storedSuggestion?.transactionID || storedSuggestion.isRetired || storedSuggestion.dismissedTransactionIDs?.includes(storedSuggestion.transactionID)) {
        return null;
    }

    return (
        <MerchantRuleSuggestionBannerContent
            reportID={reportID}
            policyID={policyID}
            transactionID={transactionID}
            containerStyles={containerStyles}
            shouldOverlayScrollArea={shouldOverlayScrollArea}
        />
    );
}

MerchantRuleSuggestionBanner.displayName = 'MerchantRuleSuggestionBanner';

export default MerchantRuleSuggestionBanner;
