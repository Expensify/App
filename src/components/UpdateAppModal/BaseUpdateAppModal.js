import React, {memo, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import withLocalize from '@components/withLocalize';
import {defaultProps, propTypes} from './updateAppModalPropTypes';

function BaseUpdateAppModal({translate, onSubmit}) {
    const [isModalOpen, setIsModalOpen] = useState(true);

    /**
     * Execute the onSubmit callback and close the modal.
     */
    function submitAndClose() {
        onSubmit();
        setIsModalOpen(false);
    }

    return (
        <ConfirmModal
            title={translate('baseUpdateAppModal.updateApp')}
            isVisible={isModalOpen}
            onConfirm={() => submitAndClose()}
            onCancel={() => setIsModalOpen(false)}
            prompt={translate('baseUpdateAppModal.updatePrompt')}
            confirmText={translate('baseUpdateAppModal.updateApp')}
            cancelText={translate('common.cancel')}
        />
    );
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;

export default memo(withLocalize(BaseUpdateAppModal));
