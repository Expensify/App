import React, {memo} from 'react';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSecondaryActionAPaymentOption} from '@libs/PaymentUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import KYCWall from './KYCWall';
import type {KYCWallProps} from './KYCWall/types';

type MoneyReportHeaderKYCDropdownProps = Omit<KYCWallProps, 'children' | 'enablePaymentsRoute'> & {
    primaryAction?: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    applicableSecondaryActions?: Array<DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>>>;
    options?: Array<DropdownOption<string>>;
    onPaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow, isSelectedTransactionAction?: boolean) => void;
    customText?: string; // Custom text to display on the button
    isSelectedTransactionAction?: boolean;
    /** Whether the button should use success style or not */
    shouldShowSuccessStyle?: boolean;
};

function MoneyReportHeaderKYCDropdown({
    onSuccessfulKYC,
    primaryAction,
    chatReportID,
    applicableSecondaryActions,
    iouReport,
    onPaymentSelect,
    ref,
    options,
    customText,
    isSelectedTransactionAction,
    shouldShowSuccessStyle,
    ...props
}: MoneyReportHeaderKYCDropdownProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const optionsShown = applicableSecondaryActions ?? options ?? [];
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
                    success={shouldShowSuccessStyle ?? !!isSelectedTransactionAction}
                    onPress={() => {}}
                    onSubItemSelected={(item, _index, event) => {
                        if (!isSecondaryActionAPaymentOption(item)) {
                            return;
                        }
                        onPaymentSelect(event, item.value, triggerKYCFlow, isSelectedTransactionAction);
                    }}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu
                    shouldPopoverUseScrollView={optionsShown.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                    customText={customText ?? translate('common.more')}
                    options={optionsShown}
                    isSplitButton={false}
                    wrapperStyle={shouldDisplayNarrowVersion && [!primaryAction && applicableSecondaryActions && styles.flex1, options && styles.w100]}
                    shouldUseModalPaddingStyle
                    sentryLabel={CONST.SENTRY_LABEL.MORE_MENU.MORE_BUTTON}
                />
            )}
        </KYCWall>
    );
}

export default memo(MoneyReportHeaderKYCDropdown);
