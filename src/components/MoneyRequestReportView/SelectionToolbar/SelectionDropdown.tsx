import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {KYCWallRef} from '@components/KYCWall/types';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type SelectionDropdownProps = {
    chatReport: OnyxEntry<Report>;
    report: OnyxEntry<Report>;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    selectedTransactionsOptions: Array<DropdownOption<string>>;
    selectedTransactionIDs: string[];

    /** Whether the selection mode is pay-in */
    hasPayInSelectionMode: boolean;

    /** Callback to select the payment */
    onSelectionModePaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => void;

    /** Callback for the end of the onContinue trigger on option selection */
    selectionModeKYCSuccess: (type?: PaymentMethodType) => void;

    /** Callback when a workspace policy payment option is selected */
    onWorkspacePolicySelect: (policy: Policy, triggerKYCFlow: TriggerKYCFlow) => void;

    /** Reference to the KYC wall */
    kycWallRef: React.RefObject<KYCWallRef | null>;

    /** Whether the popover content should be scrollable */
    shouldPopoverUseScrollView: boolean;
};

function SelectionDropdown({
    hasPayInSelectionMode,
    chatReport,
    report,
    onSelectionModePaymentSelect,
    selectionModeKYCSuccess,
    onWorkspacePolicySelect,
    primaryAction,
    selectedTransactionsOptions,
    selectedTransactionIDs,
    kycWallRef,
    shouldPopoverUseScrollView,
}: SelectionDropdownProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isInLandscapeMode = useIsInLandscapeMode();

    if (hasPayInSelectionMode) {
        return (
            <View style={isInLandscapeMode ? undefined : [styles.ph5]}>
                <MoneyReportHeaderKYCDropdown
                    chatReportID={chatReport?.reportID}
                    iouReport={report}
                    onPaymentSelect={onSelectionModePaymentSelect}
                    onWorkspacePolicySelect={onWorkspacePolicySelect}
                    onSuccessfulKYC={selectionModeKYCSuccess}
                    primaryAction={primaryAction}
                    applicableSecondaryActions={selectedTransactionsOptions}
                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                    shouldShowSuccessStyle
                    ref={kycWallRef}
                    shouldPutHeaderTextAfterBackButton
                />
            </View>
        );
    }

    return (
        <ButtonWithDropdownMenu
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => null}
            options={selectedTransactionsOptions}
            customText={translate('workspace.common.selected', {
                count: selectedTransactionIDs.length,
            })}
            isSplitButton={false}
            shouldAlwaysShowDropdownMenu
            shouldPopoverUseScrollView={shouldPopoverUseScrollView}
            wrapperStyle={isInLandscapeMode ? undefined : [styles.w100, styles.ph5]}
        />
    );
}

export default SelectionDropdown;
