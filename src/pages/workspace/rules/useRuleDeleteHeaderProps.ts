import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

type RuleDeleteHeaderPropsParams = {
    /** Whether there is a rule to delete and the user may delete it. */
    canDelete: boolean;

    /**
     * Deletes the rule. Confirming is handled here, and so is leaving the page, but only on a `true` return: a caller
     * that bails out keeps the user where they are rather than sending them off a page whose rule is still there.
     */
    onDelete: () => boolean;

    sentryLabel: ValueOf<typeof CONST.SENTRY_LABEL.WORKSPACE.RULES>;

    /**
     * Where to land after deleting, for the editors that can be reached from more than one place. Category settings
     * opens its own rules directly, so going back a screen from there would land on the New rule hub the user never
     * saw. The save paths pass the same route for the same reason.
     */
    backTo?: Route;

    /** Overrides the confirmation copy for rule types that word it their own way. */
    titleKey?: TranslationPaths;
    promptKey?: TranslationPaths;
};

/**
 * The header props that put a rule's delete on a trashcan in the top right, and the confirmation behind it, which
 * every rule editor shares so the gesture is the same whichever kind of rule is open.
 *
 * `HeaderWithBackButton` renders a single three-dots item as the icon itself, so one item is what makes this a
 * trashcan rather than a menu. `canDelete` decides whether it appears at all: an unsaved rule has nothing to delete,
 * a member without write access can't, and a rule already on its way out would otherwise be deleted twice.
 *
 * The copy defaults to the pair the rules tables already use for their bulk delete, so deleting one rule and deleting
 * several read alike. It lives under `merchantRules` because that table had delete first, not because it is
 * merchant-specific.
 */
function useRuleDeleteHeaderProps({canDelete, onDelete, sentryLabel, backTo, titleKey, promptKey}: RuleDeleteHeaderPropsParams) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const confirmDelete = () => {
        showConfirmModal({
            title: translate(titleKey ?? 'workspace.rules.merchantRules.deleteRule'),
            prompt: translate(promptKey ?? 'workspace.rules.merchantRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            if (!onDelete()) {
                return;
            }

            Navigation.goBack(backTo);
        });
    };

    const threeDotsMenuItems: PopoverMenuItem[] = [
        {
            icon: icons.Trashcan,
            text: translate('common.delete'),
            onSelected: confirmDelete,
            sentryLabel,
        },
    ];

    return {
        /** Spread onto `HeaderWithBackButton`. */
        deleteHeaderProps: {
            threeDotsMenuItems,
            shouldShowThreeDotsButton: canDelete,
            shouldMinimizeMenuButton: true,
        },

        /** The same confirmation, for the pre-revamp footer button the two beta-gated pages still show. */
        confirmDelete,
    };
}

export default useRuleDeleteHeaderProps;
