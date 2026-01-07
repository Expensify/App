import React from 'react';
import {View} from 'react-native';
import Hoverable from '@components/Hoverable';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {
    getIsTravelInvoicingEnabled,
    getTravelLimit,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelSpend,
    hasTravelInvoicingSettlementAccount,
    PROGRAM_TRAVEL_US,
} from '@libs/TravelInvoicingUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import GetStartedTravelInvoicing from './GetStartedTravelInvoicing';

type WorkspaceTravelInvoicingSectionProps = {
    /** The ID of the policy */
    policyID: string;
};

/**
 * Displays the Travel Invoicing section within the Workspace Travel page.
 * Shows a setup CTA if Travel Invoicing is not configured, otherwise shows the settings.
 */
function WorkspaceTravelInvoicingSection({policyID}: WorkspaceTravelInvoicingSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow']);

    // For Travel Invoicing, we use a travel-specific card settings key
    // The format is: private_expensifyCardSettings_{workspaceAccountID}_{feedType}
    // where feedType is PROGRAM_TRAVEL_US for Travel Invoicing
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${PROGRAM_TRAVEL_US}`, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    // Use pure selectors to derive state
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(cardSettings);
    const hasSettlementAccount = hasTravelInvoicingSettlementAccount(cardSettings);
    const travelSpend = getTravelSpend(cardSettings);
    const travelLimit = getTravelLimit(cardSettings);
    const settlementAccount = getTravelSettlementAccount(cardSettings, bankAccountList);
    const settlementFrequency = getTravelSettlementFrequency(cardSettings);
    const localizedFrequency =
        settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY
            ? translate('workspace.expensifyCard.frequency.monthly')
            : translate('workspace.expensifyCard.frequency.daily');

    // Format currency values (assuming USD for Travel Invoicing based on PROGRAM_TRAVEL_US)
    const formattedSpend = convertToDisplayString(travelSpend, CONST.CURRENCY.USD);
    const formattedLimit = convertToDisplayString(travelLimit, CONST.CURRENCY.USD);

    // If Travel Invoicing is not enabled or no settlement account is configured, show the setup CTA
    if (!isTravelInvoicingEnabled || !hasSettlementAccount) {
        return <GetStartedTravelInvoicing policyID={policyID} />;
    }

    return (
        <>
            <Section
                title="Travel booking"
                subtitle="Congrats! You're all set to book and manage travel on this workspace."
                containerStyles={styles.p8}
                subtitleStyles={styles.mb6}
            >
                {/* Manage travel */}
                <OfflineWithFeedback errorRowStyles={styles.mh0}>
                    <MenuItemWithTopDescription
                        title="Manage travel"
                        titleStyle={styles.textStrong}
                        icon={icons.LuggageWithLines}
                        iconRight={icons.NewWindow}
                        wrapperStyle={[styles.ph0]}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            </Section>
            <Section containerStyles={styles.p8}>
                {/* Central invoicing toggle */}
                <View style={[styles.flexRow, styles.mb3]}>
                    <Hoverable>
                        {() => (
                            <View style={styles.w100}>
                                <ToggleSettingOptionRow
                                    disabled={false}
                                    disabledAction={() => {}}
                                    title="Central invoicing"
                                    titleStyle={styles.textStrong}
                                    subtitle="Allow your members to pay and bill travel directly to the workspace"
                                    switchAccessibilityLabel="Allow your members to pay and bill travel directly to the workspace"
                                    isActive
                                    pendingAction={null}
                                    onToggle={() => {}}
                                    showLockIcon={false}
                                    errors={undefined}
                                    onCloseError={() => {}}
                                    onPress={() => {}}
                                />
                            </View>
                        )}
                    </Hoverable>
                </View>

                {/* Current travel spend */}
                <OfflineWithFeedback errorRowStyles={styles.mh0}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.currentSpend')}
                        title={formattedSpend}
                        wrapperStyle={[styles.ph0]}
                        shouldShowRightIcon={false}
                    />
                </OfflineWithFeedback>

                {/* Travel spend limit */}
                <OfflineWithFeedback errorRowStyles={styles.mh0}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.spendLimit')}
                        title={formattedLimit}
                        wrapperStyle={[styles.ph0]}
                        shouldShowRightIcon={false}
                    />
                </OfflineWithFeedback>

                {/* Settlement account */}
                <OfflineWithFeedback errorRowStyles={styles.mh0}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.settlementAccount')}
                        title={`${settlementAccount?.displayName ?? 'Unknown'} ${CONST.MASKED_PAN_PREFIX}${settlementAccount?.last4 ?? '1234'}`}
                        wrapperStyle={[styles.ph0]}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>

                {/* Settlement frequency */}
                <OfflineWithFeedback errorRowStyles={styles.mh0}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.settlementFrequency')}
                        title={localizedFrequency}
                        wrapperStyle={[styles.ph0]}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            </Section>
        </>
    );
}

WorkspaceTravelInvoicingSection.displayName = 'WorkspaceTravelInvoicingSection';

export default WorkspaceTravelInvoicingSection;
