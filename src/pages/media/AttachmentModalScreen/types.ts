import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type {AttachmentModalScreen} from '@src/SCREENS';
import type ModalType from '@src/types/utils/ModalType';
import type {AttachmentModalBaseContentProps} from './AttachmentModalBaseContent/types';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type AttachmentModalModalProps = {
    modalType?: ModalType;
    onShow?: () => void;
    onClose?: () => void;
    shouldHandleNavigationBack?: boolean;
};

// {
//     file?: FileObject | FileObject[];
//     reportID?: string;
//     policyID?: string;
//     transactionID?: string;
//     readonly?: boolean;
//     isFromReviewDuplicates?: boolean;
//     hashKey?: number;
//     backTo?: Routes;
//     letter?: UpperCaseCharacters;

//     /** The iou action of the expense creation flow of which we are displaying the receipt for. */
//     iouAction?: IOUAction;

//     /** The iou type of the expense creation flow of which we are displaying the receipt for. */
//     iouType?: IOUType;
// };

type AttachmentModalScreenParams = AttachmentModalBaseContentProps & AttachmentModalModalProps;

type AttachmentModalScreenProps<Screen extends AttachmentModalScreen> = PlatformStackScreenProps<RootNavigatorParamList, Screen>;

export type {AttachmentModalScreenParams, AttachmentModalModalProps, AttachmentModalScreenProps, FileObject, ImagePickerResponse};
