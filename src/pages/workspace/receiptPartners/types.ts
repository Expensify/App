import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {ErrorFields, PendingFields} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type MenuItemData = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']; errors?: OfflineWithFeedbackProps['errors']};

type ReceiptPartnersIntegration = {
    title: string;
    description: string;
    icon: IconAsset;
    pendingFields?: PendingFields<string>;
    errorFields?: ErrorFields;
};

export type {MenuItemData, ReceiptPartnersIntegration};
