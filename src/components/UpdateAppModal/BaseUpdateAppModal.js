import React, {useState} from 'react';
import {propTypes, defaultProps} from './updateAppModalPropTypes';
import ConfirmModal from '../ConfirmModal';
import withLocalize from '../withLocalize';

function BaseUpdateAppModal(props) {
    const [isModalOpen, setIsModalOpen] = useState(true);

    /**
     * Execute the onSubmit callback and close the modal.
     */
    function submitAndClose() {
        props.onSubmit();
        setIsModalOpen(false);
    }

    return (
        <ConfirmModal
            title={props.translate('baseUpdateAppModal.updateApp')}
            isVisible={isModalOpen}
            onConfirm={submitAndClose}
            onCancel={() => setIsModalOpen(false)}
            prompt={props.translate('baseUpdateAppModal.updatePrompt')}
            confirmText={props.translate('baseUpdateAppModal.updateApp')}
            cancelText={props.translate('common.cancel')}
        />
    );
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;

export default withLocalize(BaseUpdateAppModal);
