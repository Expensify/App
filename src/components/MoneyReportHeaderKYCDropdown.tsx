import React, {memo} from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSecondaryActionAPaymentOption, isSecondaryActionAWorkspacePolicyOption} from '@libs/PaymentUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuRef, DropdownOption} from './ButtonWithDropdownMenu/types';
import KYCWall from './KYCWall';
import type {KYCWallProps} from './KYCWall/types';

type MoneyReportHeaderKYCDropdownProps = Omit<KYCWallProps, 'children' | 'enablePaymentsRoute'> & {
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';

    applicableSecondaryActions: Array<DropdownOption<string>>;

    onPaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => void;

    /**
     * Called when a workspace-policy sub-item is picked. The parent owns the full flow (guards, telemetry,
     * then invoking `triggerKYCFlow({policy})` when ready). If omitted, defaults to `triggerKYCFlow({policy})`.
     */
    onWorkspacePolicySelect?: (policy: Policy, triggerKYCFlow: TriggerKYCFlow) => void;

    customText?: string;

    shouldShowSuccessStyle?: boolean;

    /** Ref for the inner ButtonWithDropdownMenu */
    dropdownMenuRef?: React.Ref<ButtonWithDropdownMenuRef>;

    /** Callback fired when the dropdown menu hides */
    onOptionsMenuHide?: () => void;
};

function MoneyReportHeaderKYCDropdown({
    onSuccessfulKYC,
    primaryAction,
    chatReportID,
    applicableSecondaryActions,
    iouReport,
    onPaymentSelect,
    onWorkspacePolicySelect,
    customText,
    shouldShowSuccessStyle,
    dropdownMenuRef,
    onOptionsMenuHide,
    ref,
    ...props
}: MoneyReportHeaderKYCDropdownProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <KYCWall
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onSuccessfulKYC={onSuccessfulKYC}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            isDisabled={isOffline}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReportID}
            iouReport={iouReport}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
            }}
            ref={ref}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu
                    ref={dropdownMenuRef}
                    success={shouldShowSuccessStyle ?? false}
                    onPress={() => {}}
                    onSubItemSelected={(item, _index, event) => {
                        if (isSecondaryActionAWorkspacePolicyOption(item)) {
                            if (onWorkspacePolicySelect) {
                                onWorkspacePolicySelect(item.workspacePolicy, triggerKYCFlow);
                            } else {
                                triggerKYCFlow({policy: item.workspacePolicy});
                            }
                            return;
                        }
                        if (!isSecondaryActionAPaymentOption(item)) {
                            return;
                        }
                        onPaymentSelect(event, item.value, triggerKYCFlow);
                    }}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu
                    shouldPopoverUseScrollView={shouldPopoverUseScrollView(applicableSecondaryActions)}
                    customText={customText ?? translate('common.more')}
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                    wrapperStyle={shouldDisplayNarrowVersion && [!primaryAction && !customText && styles.flex1, !!customText && styles.w100]}
                    shouldUseModalPaddingStyle
                    onOptionsMenuHide={onOptionsMenuHide}
                    sentryLabel={CONST.SENTRY_LABEL.MORE_MENU.MORE_BUTTON}
                />
            )}
        </KYCWall>
    );
}

export default memo(MoneyReportHeaderKYCDropdown);
