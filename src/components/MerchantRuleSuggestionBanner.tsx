import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearMerchantRuleSuggestionFields, dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion} from '@libs/actions/MerchantRuleSuggestion';
import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction, isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Animated, {FadeInDown, FadeInUp, FadeOutDown, FadeOutUp} from 'react-native-reanimated';

import Banner from './Banner';
import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';
import {useWideRHPState} from './WideRHPContextProvider';

type MerchantRuleSuggestionBannerProps = {
    /** The report hosting the expense detail view: a transaction thread, its expense report, or the chat it lives in */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;

    /** Styles for the banner container */
    containerStyles?: StyleProp<ViewStyle>;

    /** When set, floats the callout in a wrapper carrying these styles instead of laying it out inline */
    overlayStyles?: StyleProp<ViewStyle>;

    /**
     * Whether this mount point is the one above the composer. It decides both the edge the callout slides in from and
     * which layouts it belongs in, since the composer takes the wide layouts and the report list takes the narrow ones.
     */
    isAnchoredToBottom?: boolean;
};

function MerchantRuleSuggestionBannerContent({reportID, policyID, containerStyles, overlayStyles, isAnchoredToBottom}: MerchantRuleSuggestionBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb']);
    const {suggestion, fields, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID);

    if (!suggestion || !policyID) {
        return null;
    }

    const dismiss = () => dismissMerchantRuleSuggestion(suggestion);

    const createRule = () => {
        const draft = getMerchantRuleDraftFromTransaction(transaction, fields, policy);
        if (!draft) {
            return;
        }
        // Seed the draft the rule editor reads, then open the same flow used from workspace settings. Opening it as a
        // suffix on the expense's own path keeps the expense underneath the modal, so the flow returns here rather
        // than to the workspace Rules page.
        setDraftMerchantRule(draft);
        // The offer has been taken, so coming back from the rule flow, saved or abandoned, must not find it still
        // asking, and the recording that fed it ends here. Editing the expense again starts a fresh offer, gathering
        // only what changes from now on rather than repeating fields already carried into this rule.
        clearMerchantRuleSuggestionFields(suggestion.transactionID);
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

/**
 * Offers the chance to turn an expense edit into a merchant rule, right on the expense that was just edited. Renders
 * nothing unless there is a qualifying edit to act on.
 */
function MerchantRuleSuggestionBanner({reportID, policyID, containerStyles, overlayStyles, isAnchoredToBottom}: MerchantRuleSuggestionBannerProps) {
    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    // A full-size composer leaves no room for the callout, and on narrow layouts it would sit over the button that
    // collapses the composer again.
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // A wide RHP reports a narrow layout but lays the expense out like a wide screen, so it belongs to the composer
    // mount alongside the genuinely wide layouts.
    const route = useRoute();
    const {wideRHPRouteKeys} = useWideRHPState();
    const isInWideRHP = !!route?.key && wideRHPRouteKeys.includes(route.key);

    // Both mount points are always rendered, and this picks the one that suits the layout. Deciding here rather than
    // at each mount keeps the two halves of the condition from drifting apart, and keeps the navigation-state
    // subscription out of the report actions list, which re-renders far more than this does.
    const isMountForThisLayout = isAnchoredToBottom ? !shouldUseNarrowLayout || isInWideRHP : shouldUseNarrowLayout && !isInWideRHP;

    // Nothing is stored for most of a session, so skip the inner component and its many Onyx subscriptions until
    // there is an edit to offer.
    if (!isMountForThisLayout || isComposerFullSize || !isMerchantRuleSuggestionLive(storedSuggestion)) {
        return null;
    }

    return (
        <MerchantRuleSuggestionBannerContent
            reportID={reportID}
            policyID={policyID}
            containerStyles={containerStyles}
            overlayStyles={overlayStyles}
            isAnchoredToBottom={isAnchoredToBottom}
        />
    );
}

export default MerchantRuleSuggestionBanner;
