import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

type ImportMerchantRulesOptionParams = {
    /** The policy ID the merchant rules belong to */
    policyID: string;

    /** Whether the current user can write rules on the policy */
    canWriteRules: boolean;

    /** Shows the read-only explanation modal when the user cannot write rules */
    showReadOnlyModal: () => void;

    /** Locale translate function */
    translate: LocaleContextProps['translate'];

    /** Icon shown next to the option */
    icon: IconAsset;
};

/**
 * Builds the "Import spreadsheet" dropdown option for merchant rules, shared by the
 * legacy Rules page and the revamped Rules page so both stay in sync.
 */
function getImportMerchantRulesOption({
    policyID,
    canWriteRules,
    showReadOnlyModal,
    translate,
    icon,
}: ImportMerchantRulesOptionParams): DropdownOption<DeepValueOf<typeof CONST.POLICY.SECONDARY_ACTIONS>> {
    return {
        icon,
        text: translate('workspace.rules.merchantRules.importRulesTitle'),
        value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
        onSelected: () => {
            if (!canWriteRules) {
                showReadOnlyModal();
                return;
            }
            Navigation.navigate(ROUTES.RULES_MERCHANT_IMPORT.getRoute(policyID));
        },
    };
}

export default getImportMerchantRulesOption;
