import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion} from '@libs/actions/MerchantRuleSuggestion';
import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {FadeInDown, FadeInUp, FadeOutDown, FadeOutUp} from 'react-native-reanimated';

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

    /** When set, floats the callout in a wrapper carrying these styles instead of laying it out inline */
    overlayStyles?: StyleProp<ViewStyle>;

    /** Whether the callout is pinned to the bottom of its host, which is the edge it slides in from */
    isAnchoredToBottom?: boolean;
};

function MerchantRuleSuggestionBannerContent({reportID, policyID, transactionID, containerStyles, overlayStyles, isAnchoredToBottom}: MerchantRuleSuggestionBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID, transactionID);

    // The offer ends once the user has seen it and navigated away. Retiring leaves the expense itself untouched, so
    // editing it again offers afresh. Only the close button silences an expense for the session.
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

    const dismiss = () => dismissMerchantRuleSuggestion(suggestion);

    const createRule = () => {
        const draft = getMerchantRuleDraftFromTransaction(transaction, suggestion.field, policy);
        if (!draft) {
            return;
        }
        // Seed the draft the rule editor reads, then open the same flow used from workspace settings. Opening it as a
        // suffix on the expense's own path keeps the expense underneath the modal, so the flow returns here rather
        // than to the workspace Rules page.
        setDraftMerchantRule(draft);
        // The offer has been taken, so coming back from the rule flow, saved or abandoned, must not find it still
        // asking. Editing the expense again starts a fresh offer.
        retireMerchantRuleSuggestion();
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.RULES_MERCHANT_NEW_FROM_EXPENSE.getRoute(policyID)));
    };

    // The callout appears and disappears in place, so it slides out of the edge it is pinned to rather than popping.
    // FloatingMessageCounter springs a parked view instead, which this cannot do because it unmounts when there is
    // nothing to offer.
    return (
        <Animated.View
            style={overlayStyles}
            entering={isAnchoredToBottom ? FadeInDown : FadeInUp}
            exiting={isAnchoredToBottom ? FadeOutDown : FadeOutUp}
        >
            <Banner
                containerStyles={[styles.merchantRuleCalloutContainer, styles.p4, containerStyles]}
                shouldShowCloseButton
                onClose={dismiss}
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
                        <Text style={[styles.flex1, styles.merchantRuleCalloutText, styles.mr3]}>
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
        </Animated.View>
    );
}

MerchantRuleSuggestionBannerContent.displayName = 'MerchantRuleSuggestionBannerContent';

/**
 * Offers the chance to turn an expense edit into a merchant rule, right on the expense that was just edited. Renders
 * nothing unless there is a qualifying edit to act on.
 */
function MerchantRuleSuggestionBanner({reportID, policyID, transactionID, containerStyles, overlayStyles, isAnchoredToBottom}: MerchantRuleSuggestionBannerProps) {
    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);

    // Nothing is stored for most of a session, so skip the inner component and its many Onyx subscriptions until
    // there is an edit to offer.
    if (!storedSuggestion?.transactionID || storedSuggestion.isRetired || storedSuggestion.dismissedTransactionIDs?.includes(storedSuggestion.transactionID)) {
        return null;
    }

    return (
        <MerchantRuleSuggestionBannerContent
            reportID={reportID}
            policyID={policyID}
            transactionID={transactionID}
            containerStyles={containerStyles}
            overlayStyles={overlayStyles}
            isAnchoredToBottom={isAnchoredToBottom}
        />
    );
}

MerchantRuleSuggestionBanner.displayName = 'MerchantRuleSuggestionBanner';

export default MerchantRuleSuggestionBanner;
