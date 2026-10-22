import FeatureTrainingModalWrapper from '@components/Modal/Global/FeatureTrainingModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type FeatureTrainingModalOptions = Omit<React.ComponentProps<typeof FeatureTrainingModalWrapper>, keyof ModalProps> & {
    id?: string;
};

const useFeatureTrainingModal = () => {
    const context = useModal();

    const showFeatureTrainingModal = ({id, ...options}: FeatureTrainingModalOptions) => {
        return context.showModal({
            component: FeatureTrainingModalWrapper,
            id,
            props: options,
        });
    };

    const closeFeatureTrainingModal = (id: string) => context.closeModalByID(id);

    return {showFeatureTrainingModal, closeFeatureTrainingModal};
};

export default useFeatureTrainingModal;
