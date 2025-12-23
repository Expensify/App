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
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';

    applicableSecondaryActions: Array<DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>>>;

    onPaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => void;
};

function MoneyReportHeaderKYCDropdown({
    onSuccessfulKYC,
    primaryAction,
    chatReportID,
    applicableSecondaryActions,
    iouReport,
    onPaymentSelect,
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
                    success={false}
                    onPress={() => {}}
                    onSubItemSelected={(item, index, event) => {
                        if (!isSecondaryActionAPaymentOption(item)) {
                            return;
                        }
                        onPaymentSelect(event, item.value, triggerKYCFlow);
                    }}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu
                    shouldPopoverUseScrollView={applicableSecondaryActions.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                    customText={translate('common.more')}
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                    wrapperStyle={shouldDisplayNarrowVersion && [!primaryAction && styles.flex1]}
                    shouldUseModalPaddingStyle
                    sentryLabel={CONST.SENTRY_LABEL.MORE_MENU.MORE_BUTTON}
                />
            )}
        </KYCWall>
    );
}

export default memo(MoneyReportHeaderKYCDropdown);
