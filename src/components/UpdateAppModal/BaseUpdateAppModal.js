import React, {PureComponent} from 'react';
import {propTypes, defaultProps} from './UpdateAppModalPropTypes';
import ConfirmModal from '../ConfirmModal';

class BaseUpdateAppModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: true,
        };

        this.submitAndClose = this.submitAndClose.bind(this);
    }

    /**
     * Execute the onSubmit callback and close the modal.
     */
    submitAndClose() {
        this.props.onSubmit(this.state.file);
        this.setState({isModalOpen: false});
    }

    render() {
        return (
            <>
                <ConfirmModal
                    title="Update App"
                    isVisible={this.state.isModalOpen}
                    onConfirm={this.submitAndClose}
                    onCancel={() => this.setState({isModalOpen: false})}
                    prompt="A new version of Expensify.cash is available.
                    Update now or restart the app at a later time to download the latest changes."
                    confirmText="Update App"
                    cancelText="Cancel"
                />
            </>
        );
    }
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;
export default BaseUpdateAppModal;
