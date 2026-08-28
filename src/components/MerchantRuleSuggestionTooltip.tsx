import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {retireMerchantRuleSuggestion, setIsCreatingMerchantRule} from '@libs/actions/MerchantRuleSuggestion';
import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ReactElement} from 'react';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import {useProductTrainingContext} from './ProductTrainingContext';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type MerchantRuleSuggestionTooltipProps = {
    /** The report hosting the expense detail view: a transaction thread, its expense report, or the chat it lives in */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;

    /** The expense being displayed, when the host already knows it */
    transactionID?: string;

    /** The element the tooltip anchors to */
    children: ReactElement;
};

function MerchantRuleSuggestionTooltipInner({reportID, policyID, transactionID, children}: MerchantRuleSuggestionTooltipProps) {
    const styles = useThemeStyles();
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID, transactionID);
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MERCHANT_RULE_SUGGESTION,
        !!suggestion,
    );

    const hasBeenShownRef = useRef(false);
    useEffect(() => {
        if (!shouldShowProductTrainingTooltip) {
            return;
        }
        hasBeenShownRef.current = true;
    }, [shouldShowProductTrainingTooltip]);

    // The offer is about the edit the user just made, so it ends once they have seen it and moved on. Retiring rather
    // than dismissing keeps this out of the NVP: leaving the view should not silence the expense for good, only stop
    // the callout from re-appearing on every return to it.
    useEffect(
        () => () => {
            if (!hasBeenShownRef.current) {
                return;
            }
            retireMerchantRuleSuggestion();
        },
        [],
    );

    const createRule = () => {
        if (!suggestion || !policyID) {
            return;
        }
        const draft = getMerchantRuleDraftFromTransaction(transaction, suggestion.field, policy);
        if (!draft) {
            return;
        }
        // Seed the draft the rule editor reads, then open the same flow used from workspace settings
        setDraftMerchantRule(draft);
        // Tells that flow it was entered from an expense, so saving returns here rather than to the Rules page
        setIsCreatingMerchantRule(true);
        hideProductTrainingTooltip();
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderProductTrainingTooltip}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            shiftVertical={variables.mileageRateTooltipShiftVertical}
            onTooltipPress={createRule}
            shouldHidePointer
        >
            {/* The tooltip measures its anchor by cloning this child with an `onLayout` prop, so it has to be a plain
                View: the composer and the receipt view don't forward that prop, which would leave it unmeasured. */}
            <View>{children}</View>
        </EducationalTooltip>
    );
}

MerchantRuleSuggestionTooltipInner.displayName = 'MerchantRuleSuggestionTooltipInner';

/**
 * Anchors the "Create a rule" product training tooltip to the wrapped element, offering a workspace admin the chance
 * to turn the expense edit they just made into a merchant rule. Renders the children untouched when there is no
 * qualifying edit to act on.
 */
function MerchantRuleSuggestionTooltip({reportID, policyID, transactionID, children}: MerchantRuleSuggestionTooltipProps) {
    const [storedSuggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const [dismissedSuggestions] = useOnyx(ONYXKEYS.NVP_DISMISSED_MERCHANT_RULE_SUGGESTIONS);

    // Nothing is stored for most of a session, so skip the inner component (and its heavy hooks, which subscribe to the
    // policy, its categories, the transaction and the report's transactions) until an edit is waiting to be offered.
    if (!storedSuggestion?.transactionID || storedSuggestion.isRetired || dismissedSuggestions?.[storedSuggestion.transactionID]) {
        return children;
    }

    return (
        <MerchantRuleSuggestionTooltipInner
            reportID={reportID}
            policyID={policyID}
            transactionID={transactionID}
        >
            {children}
        </MerchantRuleSuggestionTooltipInner>
    );
}

MerchantRuleSuggestionTooltip.displayName = 'MerchantRuleSuggestionTooltip';

export default MerchantRuleSuggestionTooltip;
