import React, {useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import ConfirmModal from './ConfirmModal';

function UpdateAppModal() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const {translate} = useLocalize();
    const [updateAvailable] = useOnyx(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE);

    if (!updateAvailable) {
        return null;
    }

    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <ConfirmModal
            title={translate('baseUpdateAppModal.updateApp')}
            isVisible={isModalOpen}
            onConfirm={handleClose}
            onCancel={handleClose}
            prompt={translate('baseUpdateAppModal.updatePrompt')}
            confirmText={translate('baseUpdateAppModal.updateApp')}
            cancelText={translate('common.cancel')}
        />
    );
}

export default UpdateAppModal;
