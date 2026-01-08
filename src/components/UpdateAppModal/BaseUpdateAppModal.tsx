import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import type UpdateAppModalProps from './types';

function BaseUpdateAppModal({onSubmit}: UpdateAppModalProps) {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const {translate} = useLocalize();

    /**
     * Execute the onSubmit callback and close the modal.
     */
    const submitAndClose = () => {
        onSubmit?.();
        setIsModalOpen(false);
    };

    return (
        <ConfirmModal
            title={translate('baseUpdateAppModal.updateApp')}
            isVisible={isModalOpen}
            onConfirm={submitAndClose}
            onCancel={() => setIsModalOpen(false)}
            prompt={translate('baseUpdateAppModal.updatePrompt')}
            confirmText={translate('baseUpdateAppModal.updateApp')}
            cancelText={translate('common.cancel')}
        />
    );
}

BaseUpdateAppModal.displayName = 'BaseUpdateAppModal';

export default React.memo(BaseUpdateAppModal);
