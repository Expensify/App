import MobileSelectionMenuModalWrapper from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import type {MobileSelectionMenuModalWrapperProps} from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type MobileSelectionMenuModalOptions = Omit<MobileSelectionMenuModalWrapperProps, keyof ModalProps> & {
    id?: string;
};

const useMobileSelectionMenuModal = () => {
    const context = useModal();

    const showMobileSelectionMenuModal = ({id, ...options}: MobileSelectionMenuModalOptions = {}) => {
        return context.showModal({
            component: MobileSelectionMenuModalWrapper,
            id,
            props: options,
        });
    };

    return {showMobileSelectionMenuModal};
};

export default useMobileSelectionMenuModal;
