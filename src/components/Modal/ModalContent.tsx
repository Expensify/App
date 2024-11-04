import type {ReactNode} from 'react';
import useEffectOnce from '@hooks/useEffectOnce';

type ModalContentProps = {
    /** Modal contents */
    children: ReactNode;

    /**
     * Callback method fired after modal content is unmounted.
     * isVisible is not enough to cover all modal close cases,
     * such as closing the attachment modal through the browser's back button.
     * */
    onDismiss: () => void;

    /** Callback method fired after modal content is mounted. */
    onModalWillShow: () => void;
};

function ModalContent({children, onDismiss = () => {}, onModalWillShow = () => {}}: ModalContentProps) {
    useEffectOnce(() => {
        onModalWillShow();
        return onDismiss;
    });
    return children;
}
ModalContent.displayName = 'ModalContent';

export default ModalContent;
