import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMerchantRuleSuggestion from '@hooks/useMerchantRuleSuggestion';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftMerchantRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromTransaction} from '@libs/MerchantRuleSuggestionUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import {useProductTrainingContext} from './ProductTrainingContext';
import Text from './Text';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type MerchantRuleSuggestionTooltipProps = React.PropsWithChildren<{
    /** The report hosting the expense detail view: a transaction thread, its expense report, or the chat it lives in */
    reportID: string | undefined;

    /** The workspace the expense belongs to */
    policyID: string | undefined;

    /** The expense being displayed, when the host already knows it */
    transactionID?: string;
}>;

/**
 * Anchors the "Create a rule" product training tooltip to the wrapped element, offering a workspace admin the chance
 * to turn the expense edit they just made into a merchant rule. Renders the children untouched when there is no
 * qualifying edit to act on.
 */
function MerchantRuleSuggestionTooltip({reportID, policyID, transactionID, children}: MerchantRuleSuggestionTooltipProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb', 'Close']);
    const {suggestion, transaction, policy} = useMerchantRuleSuggestion(reportID, policyID, transactionID);
    const {shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MERCHANT_RULE_SUGGESTION, !!suggestion);

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

    // The shared product training content renders its copy as a single block of HTML, but this callout needs the
    // "Create a rule" phrase highlighted, so the content is composed here instead.
    const renderTooltipContent = useCallback(
        () => (
            <View
                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                style={[styles.alignItemsCenter, styles.flexRow, styles.gap3, styles.pv2, styles.ph2]}
            >
                <Icon
                    src={icons.Lightbulb}
                    fill={theme.tooltipHighlightText}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
                {/* The tooltip background is dark in both themes, so the highlighted phrase uses the palette's tooltip
                    highlight rather than `styles.link`, whose light-theme blue reads poorly against it. */}
                <View style={styles.flexShrink1}>
                    <Text style={styles.productTrainingTooltipText}>
                        <Text style={[styles.productTrainingTooltipText, {color: theme.tooltipHighlightText}]}>{translate('workspace.rules.merchantRules.createRuleFromExpenseAction')}</Text>
                        {` ${translate('workspace.rules.merchantRules.createRuleFromExpensePrompt')}`}
                    </Text>
                </View>
                <PressableWithoutFeedback
                    sentryLabel={CONST.SENTRY_LABEL.PRODUCT_TRAINING.TOOLTIP}
                    shouldUseAutoHitSlop
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    onPress={() => hideProductTrainingTooltip()}
                >
                    <Icon
                        src={icons.Close}
                        fill={theme.icon}
                        width={variables.iconSizeSemiSmall}
                        height={variables.iconSizeSemiSmall}
                    />
                </PressableWithoutFeedback>
            </View>
        ),
        [
            hideProductTrainingTooltip,
            icons.Close,
            icons.Lightbulb,
            styles.alignItemsCenter,
            styles.flexRow,
            styles.flexShrink1,
            styles.gap3,
            styles.ph2,
            styles.productTrainingTooltipText,
            styles.pv2,
            theme.icon,
            theme.tooltipHighlightText,
            translate,
        ],
    );

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderTooltipContent}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
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

MerchantRuleSuggestionTooltip.displayName = 'MerchantRuleSuggestionTooltip';

export default MerchantRuleSuggestionTooltip;
