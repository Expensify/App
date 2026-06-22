import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {canAccessSubmitWorkspaceFeatures} from '@libs/PolicyUtils';
import CONST, {SUBMIT_FEATURE_IDS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import GenericFeaturesView from './GenericFeaturesView';
import UpgradeIntroView from './UpgradeIntroView';

type Props = {
    buttonDisabled?: boolean;
    loading?: boolean;
    feature?: ValueOf<Omit<typeof CONST.UPGRADE_FEATURE_INTRO_MAPPING, typeof CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id>>;
    onUpgrade: () => void;
    /** Whether is categorizing the expense */
    isCategorizing?: boolean;
    /** Whether is adding an unreported expense to a report */
    isReporting?: boolean;
    isDistanceRateUpgrade?: boolean;
    policyID?: string;
    backTo?: Route;
    /** Target plan the user chose to upgrade to (drives Collect vs Control copy/pricing in the generic view) */
    upgradePlanType?: ValueOf<typeof CONST.POLICY.TYPE>;
};

function UpgradeIntro({feature, onUpgrade, buttonDisabled, loading, isCategorizing, isDistanceRateUpgrade, isReporting, policyID, backTo, upgradePlanType}: Props) {
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {isBetaEnabled} = usePermissions();
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const isSubmitPolicy = canAccessSubmitWorkspaceFeatures(policy, isSubmit2026BetaEnabled);
    const {translate} = useLocalize();
    const preferredCurrency = usePreferredCurrency();
    const hasTeam2025Pricing = useHasTeam2025Pricing();

    const isSubmitFeature = isSubmitPolicy && !!feature?.id && SUBMIT_FEATURE_IDS.has(feature.id);

    const formattedPrice = useMemo(() => {
        const upgradeCurrency = Object.hasOwn(CONST.SUBSCRIPTION_PRICES, preferredCurrency) ? preferredCurrency : CONST.PAYMENT_CARD_CURRENCY.USD;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const matchesTeamPricingHeuristics = isCategorizing || isDistanceRateUpgrade || isReporting || isSubmitFeature || upgradePlanType === CONST.POLICY.TYPE.TEAM;
        // An explicit upgradePlanType (chosen in the Plan RHP) is authoritative over the feature-based heuristics, so pricing matches the plan title shown in GenericFeaturesView.
        const shouldUseTeamPricing = upgradePlanType === CONST.POLICY.TYPE.CORPORATE ? false : matchesTeamPricingHeuristics;
        return `${convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[upgradeCurrency][shouldUseTeamPricing ? CONST.POLICY.TYPE.TEAM : CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            upgradeCurrency,
        )} `;
    }, [preferredCurrency, isCategorizing, isDistanceRateUpgrade, isReporting, isSubmitFeature, upgradePlanType]);

    const allIconNames = Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
        .map((feat) => feat?.icon)
        .filter((icon) => icon !== undefined);
    const illustrations = useMemoizedLazyIllustrations([
        'FolderOpen',
        'Tag',
        'Coins',
        'Rules',
        'CompanyCard',
        'PerDiem',
        'ReportReceipt',
        'CarIce',
        'BlueShield',
        'Pencil',
        'Luggage',
        'Workflows',
        'Accounting',
        'HandCard',
        'InvoiceBlue',
        'Members',
        'Approval',
    ]);
    const illustrationIcons = useMemoizedLazyExpensifyIcons(['IntacctSquare', 'NetSuiteSquare', 'QBDSquare', 'CertiniaSquare', 'AdvancedApprovalsSquare', 'Unlock']);
    const imported = new Set([...Object.keys(illustrations), ...Object.keys(illustrationIcons)]);
    const missing = allIconNames.filter((n): n is string => !!n && !imported.has(n));
    if (missing.length) {
        throw new Error(`Missing icons: ${missing.join(', ')}`);
    }

    /**
     * If the feature is null or there is no policyID, it indicates the user is not associated with any specific workspace.
     * In this case, the generic upgrade view should be shown.
     * However, the policyID check is only necessary when the user is not coming from the "Categorize" option.
     * The "isCategorizing" flag is set to true when the user accesses the "Categorize" option in the Self-DM whisper.
     * In such scenarios, a separate Categories upgrade UI is displayed.
     */
    if (!feature || (!isCategorizing && !isDistanceRateUpgrade && !isReporting && !policyID)) {
        return (
            <GenericFeaturesView
                onUpgrade={onUpgrade}
                buttonDisabled={buttonDisabled}
                formattedPrice={formattedPrice}
                loading={loading}
                policyID={policyID}
                backTo={backTo}
                upgradePlanType={upgradePlanType}
            />
        );
    }

    const isIllustration = feature.icon in illustrations;
    const isIllustrationIcon = feature.icon in illustrationIcons;
    let iconSrc;
    if (isIllustrationIcon) {
        iconSrc = illustrationIcons[feature.icon as keyof typeof illustrationIcons];
    } else if (isIllustration) {
        iconSrc = illustrations[feature.icon as keyof typeof illustrations];
    }

    const iconAdditionalStyles = feature.id === CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id ? styles.br0 : undefined;

    const onlyAvailableOnPlanHTML = translate(
        feature.id === 'preventSelfApproval' || feature.id === 'autoApproveCompliantReports' || feature.id === 'autoPayApprovedReports'
            ? 'workspace.upgrade.approvals.onlyAvailableOnPlan'
            : `workspace.upgrade.${feature.id}.onlyAvailableOnPlan`,
        {formattedPrice, hasTeam2025Pricing},
    );

    const buttonText =
        isSubmitPolicy && feature.id === CONST.UPGRADE_FEATURE_INTRO_MAPPING.expensifyCard.id ? translate('workspace.upgrade.expensifyCard.upgradeButton') : translate('common.upgrade');

    return (
        <UpgradeIntroView
            iconSrc={iconSrc}
            isIllustration={isIllustration}
            iconAdditionalStyles={iconAdditionalStyles}
            title={translate(feature.title)}
            description={translate(feature.description)}
            onlyAvailableOnPlanHTML={onlyAvailableOnPlanHTML}
            buttonText={buttonText}
            onUpgrade={onUpgrade}
            buttonDisabled={buttonDisabled}
            loading={loading}
        />
    );
}

export default UpgradeIntro;
