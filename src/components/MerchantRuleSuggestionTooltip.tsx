import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import {useProductTrainingContext} from './ProductTrainingContext';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type MerchantRuleSuggestionTooltipProps = React.PropsWithChildren<{
    /** The report hosting the expense detail view: a transaction thread or its parent expense report */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;
}>;

/**
 * Anchors the "Create a rule" product training tooltip to the wrapped element, offering a workspace admin the chance
 * to turn the expense edit they just made into a merchant rule. Renders the children untouched when there is no
 * qualifying edit to act on.
 */
function MerchantRuleSuggestionTooltip({reportID, policyID, children}: MerchantRuleSuggestionTooltipProps) {
    const styles = useThemeStyles();
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID);
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MERCHANT_RULE_SUGGESTION,
        !!suggestion,
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
        hideProductTrainingTooltip();
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID, undefined, Navigation.getActiveRoute()));
    };

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderProductTrainingTooltip}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            shiftHorizontal={variables.mileageRateTooltipShiftHorizontal}
            shiftVertical={variables.mileageRateTooltipShiftVertical}
            onTooltipPress={createRule}
            shouldHideOnScroll
        >
            {children}
        </EducationalTooltip>
    );
}

MerchantRuleSuggestionTooltip.displayName = 'MerchantRuleSuggestionTooltip';

export default MerchantRuleSuggestionTooltip;
