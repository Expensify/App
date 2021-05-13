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

        this.state = {
            isVisible: true,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
        this.cancelAndClose = this.cancelAndClose.bind(this);
    }

    /**
     * Execute the onSubmit callback and close the modal.
     */
    submitAndClose() {
        Log.info('submitAndClose', true);
        this.props.onSubmit();
        this.setState({isVisible: false});
    }

    /**
     * Execute the onCancel callback and close the modal.
     */
    cancelAndClose() {
        Log.info('cancelAndClose', true);
        this.props.onCancel();
        this.setState({isVisible: false});
    }

    render() {
        return (
            <>
                <ConfirmModal
                    title="Delete Comment"
                    isVisible={this.state.isVisible}
                    onConfirm={Log.info('submitAndClose', true)}
                    onCancel={Log.info('cancelAndClose', true)}
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
