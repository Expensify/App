import React, {PureComponent} from 'react';
import {propTypes, defaultProps} from './UpdateAppModalPropTypes';
import ConfirmModal from '../ConfirmModal';
import withLocalize from '../withLocalize';

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
                    title={this.props.translations.translate('updateApp')}
                    isVisible={this.state.isModalOpen}
                    onConfirm={this.submitAndClose}
                    onCancel={() => this.setState({isModalOpen: false})}
                    prompt={this.props.translations.translate('updatePrompt')}
                    confirmText={this.props.translations.translate('updateApp')}
                    cancelText={this.props.translations.translate('cancel')}
                />
            </>
        );
    }
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;
export default withLocalize(BaseUpdateAppModal);
