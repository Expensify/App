import type {HoldMenuModalWrapperProps} from '@components/Modal/Global/HoldMenuModalWrapper';
import HoldMenuModalWrapper, {HOLD_MENU_MODAL_ID} from '@components/Modal/Global/HoldMenuModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type HoldMenuOptions = Omit<HoldMenuModalWrapperProps, keyof ModalProps>;

const useHoldMenuModal = () => {
    const context = useModal();

    const showHoldMenu = (options: HoldMenuOptions) => {
        return context.showModal({
            component: HoldMenuModalWrapper,
            id: HOLD_MENU_MODAL_ID,
            props: options,
        });
    };

    return {showHoldMenu};
};

export default useHoldMenuModal;
