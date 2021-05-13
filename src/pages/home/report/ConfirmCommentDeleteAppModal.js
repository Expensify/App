import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../components/ConfirmModal';
import Log from '../../../libs/Log';

const propTypes = {
    // Callback to fire when we want to trigger the update.
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

class ConfirmCommentDeleteAppModal extends Component {
    constructor(props) {
        super(props);
        this.submitAndClose = this.submitAndClose.bind(this);
        this.cancelAndClose = this.cancelAndClose.bind(this);
    }

    /**
     * Execute the onSubmit callback and close the modal.
     */
    submitAndClose() {
        Log.info('submitAndClose', true);
        this.props.onSubmit();
    }

    /**
     * Execute the onCancel callback and close the modal.
     */
    cancelAndClose() {
        Log.info('cancelAndClose', true);
        this.props.onCancel();
    }

    render() {
        return (
            <>
                <ConfirmModal
                    title="Delete Comment"
                    isVisible={() => true}
                    onConfirm={this.submitAndClose}
                    onCancel={this.cancelAndClose}
                    prompt="Are you sure you want to delete this comment?"
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </>
        );
    }
}

ConfirmCommentDeleteAppModal.propTypes = propTypes;
export default ConfirmCommentDeleteAppModal;
