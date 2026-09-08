import type {PopoverMenuItem} from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

/**
 * The header props that put a rule's delete on a trashcan in the top right, which every rule editor shares so the
 * gesture is the same whichever kind of rule is open.
 *
 * `HeaderWithBackButton` renders a single three-dots item as the icon itself, so one item is what makes this a
 * trashcan rather than a menu. `canDelete` decides whether it appears at all: an unsaved rule has nothing to delete,
 * a member without write access can't, and a rule already on its way out would otherwise be deleted twice.
 */
function useRuleDeleteHeaderProps({canDelete, onDelete, sentryLabel}: {canDelete: boolean; onDelete: () => void; sentryLabel: string}) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const threeDotsMenuItems: PopoverMenuItem[] = [
        {
            icon: icons.Trashcan,
            text: translate('common.delete'),
            onSelected: onDelete,
            sentryLabel,
        },
    ];

    return {
        threeDotsMenuItems,
        shouldShowThreeDotsButton: canDelete,
        shouldMinimizeMenuButton: true,
    };
}

export default useRuleDeleteHeaderProps;
