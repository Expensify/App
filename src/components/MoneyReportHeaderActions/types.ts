import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {RejectModalAction} from '@components/MoneyReportHeaderEducationalModals';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type ModalTriggers = {
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, methodID?: number) => void;
    onPDFModalOpen: () => void;
    onHoldEducationalOpen: () => void;
    onRejectModalOpen: (action: RejectModalAction) => void;
};

type SecondaryActionEntry = DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>;

type MoneyReportHeaderActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    /** Style to apply when rendered inline (narrow layout inside HeaderWithBackButton) */
    style?: StyleProp<ViewStyle>;
    isReportInSearch?: boolean;
};

export type {ModalTriggers, SecondaryActionEntry, MoneyReportHeaderActionsProps};
