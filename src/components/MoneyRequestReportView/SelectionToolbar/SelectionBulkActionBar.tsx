import BulkActionBar from '@components/BulkActionBar';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import KYCWall from '@components/KYCWall';
import type {KYCWallRef} from '@components/KYCWall/types';

import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {isSecondaryActionAPaymentOption, isSecondaryActionAWorkspacePolicyOption} from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type SelectionBulkActionBarProps = {
    chatReport: OnyxEntry<Report>;
    report: OnyxEntry<Report>;
    selectedTransactionsOptions: Array<DropdownOption<string>>;
    selectedTransactionIDs: string[];
    onSelectionModePaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => void;

    /** Callback for the end of the onContinue trigger on option selection */
    selectionModeKYCSuccess: (type?: PaymentMethodType) => void;

    /** Callback when a workspace policy payment option is selected */
    onWorkspacePolicySelect: (policy: Policy, triggerKYCFlow: TriggerKYCFlow) => void;

    kycWallRef: React.RefObject<KYCWallRef | null>;
    onClearSelection: () => void;
};

/**
 * The wide layout's bulk actions for the transactions selected in a report.
 *
 * The bar floats over the end of the list from a sibling that precedes it, so it is lifted above the list the way the
 * floating message counter is lifted above it from the other end.
 *
 * Whether the selection can be paid changes as rows are added to it, so the wall stays mounted either way rather than
 * swapping the bar for a wrapped copy of itself. Remounting the bar would replay its entrance and throw away the
 * widths its fitting pass has measured.
 */
function SelectionBulkActionBar({
    chatReport,
    report,
    selectedTransactionsOptions,
    selectedTransactionIDs,
    onSelectionModePaymentSelect,
    selectionModeKYCSuccess,
    onWorkspacePolicySelect,
    kycWallRef,
    onClearSelection,
}: SelectionBulkActionBarProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <KYCWall
            ref={kycWallRef}
            chatReportID={chatReport?.reportID}
            iouReport={report}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            isDisabled={isOffline}
            onSuccessfulKYC={selectionModeKYCSuccess}
        >
            {(triggerKYCFlow, buttonRef) => (
                <BulkActionBar
                    selectedCount={selectedTransactionIDs.length}
                    options={selectedTransactionsOptions}
                    onClearSelection={onClearSelection}
                    barRef={buttonRef}
                    style={styles.zIndex10}
                    onSubItemSelected={(item, _index, event) => {
                        if (isSecondaryActionAWorkspacePolicyOption(item)) {
                            onWorkspacePolicySelect(item.workspacePolicy, triggerKYCFlow);
                            return;
                        }
                        if (!isSecondaryActionAPaymentOption(item)) {
                            return;
                        }
                        onSelectionModePaymentSelect(event, item.value, triggerKYCFlow);
                    }}
                />
            )}
        </KYCWall>
    );
}

export default SelectionBulkActionBar;
