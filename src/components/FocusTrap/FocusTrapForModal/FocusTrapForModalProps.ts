import type {FocusTrapProps} from 'focus-trap-react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports -- type-only: the launcher union must cover every anchor shape popovers pass, including RN Text anchors
import type {Text, View} from 'react-native';

type FocusTrapOptions = Exclude<FocusTrapProps['focusTrapOptions'], undefined>;

type FocusTrapForModalProps = {
    children: React.ReactNode;
    active: boolean;
    initialFocus?: FocusTrapOptions['initialFocus'];
    shouldPreventScroll?: boolean;
    shouldReturnFocus?: boolean;

    /**
     * The element that opened this trap, a popover's anchor. Only consulted when `document.activeElement`
     * is `body` at activation time: triggers that blur themselves to avoid a focus ring (the FAB, the composer
     * "+") leave nothing to infer the launcher from, so both the dismiss-time focus return and the nav-back
     * restore have no target. Pass the same ref the popover already uses to position itself.
     *
     * Deliberately covers every anchor shape in use (`View`, `Text`, DOM element): the trap narrows it with
     * `instanceof HTMLElement` anyway, so a ref it cannot use is simply ignored rather than rejected.
     */
    launcherRef?: RefObject<View | Text | HTMLElement | null>;
};

export default FocusTrapForModalProps;
