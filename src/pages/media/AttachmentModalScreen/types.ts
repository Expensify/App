import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type ModalType from '@src/types/utils/ModalType';
import type {AttachmentModalBaseContentProps} from './AttachmentModalBaseContent/types';

type AttachmentModalContainerModalProps = {
    /** The type of the modal */
    modalType?: ModalType;

    /** Callback to fire when the modal is shown */
    onShow?: () => void;

    /** Callback to fire when the modal is closed */
    onClose?: () => void;

    /** Whether to handle navigation back */
    shouldHandleNavigationBack?: boolean;

    /** Extra modals to be displayed in the modal */
    ExtraContent?: React.ReactNode;
};

type AttachmentModalScreenType =
    | typeof SCREENS.REPORT_ATTACHMENTS
    | typeof SCREENS.REPORT_ADD_ATTACHMENT
    | typeof SCREENS.REPORT_AVATAR
    | typeof SCREENS.PROFILE_AVATAR
    | typeof SCREENS.WORKSPACE_AVATAR
    | typeof SCREENS.TRANSACTION_RECEIPT
    | typeof SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW
    | typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT;

type AttachmentModalScreenBaseParams = AttachmentModalBaseContentProps & AttachmentModalContainerModalProps;

type AttachmentModalScreenProps<Screen extends AttachmentModalScreenType> = PlatformStackScreenProps<RootNavigatorParamList, Screen>;

export type {AttachmentModalScreenType, AttachmentModalScreenBaseParams, AttachmentModalContainerModalProps, AttachmentModalScreenProps};
