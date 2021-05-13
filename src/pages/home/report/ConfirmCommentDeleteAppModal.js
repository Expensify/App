import React, {PureComponent} from 'react';
import {propTypes, defaultProps} from '../../../components/UpdateAppModal/UpdateAppModalPropTypes';
import ConfirmModal from '../../../components/ConfirmModal';

class ConfirmCommentDeleteAppModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isVisible: true,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
    }

    /**
     * Execute the onSubmit callback and close the modal.
     */
    submitAndClose() {
        this.props.onSubmit(this.state.file);
        this.setState({isVisible: false});
    }

    render() {
        return (
            <>
                <ConfirmModal
                    title="Delete Comment"
                    isVisible={this.state.isVisible}
                    onConfirm={this.submitAndClose}
                    onCancel={() => this.setState({isVisible: false})}
                    prompt="Are you sure you want to delete this comment?"
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </>
        );
    }
}

ConfirmCommentDeleteAppModal.propTypes = propTypes;
ConfirmCommentDeleteAppModal.defaultProps = defaultProps;
export default ConfirmCommentDeleteAppModal;
