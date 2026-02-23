import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {AnchorPosition} from '@src/styles';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

const policyMapper = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    }) as PolicySelector;

type FABPopoverContentProps = {
    isMenuMounted: boolean;
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: () => void;
    onModalHide: () => void;
    anchorPosition: AnchorPosition;
    anchorRef: RefObject<HTMLDivElement | null>;
    shouldUseNarrowLayout: boolean;
};

type FABPopoverContentInnerProps = Omit<FABPopoverContentProps, 'isMenuMounted'>;

type MenuItemIcons = Record<string, IconAsset>;

export type {PolicySelector, FABPopoverContentProps, FABPopoverContentInnerProps, MenuItemIcons};
export {policyMapper};
