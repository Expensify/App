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
        const {translations: {translate}} = this.props;
        return (
            <>
                <ConfirmModal
                    title={translate('updateApp')}
                    isVisible={this.state.isModalOpen}
                    onConfirm={this.submitAndClose}
                    onCancel={() => this.setState({isModalOpen: false})}
                    prompt={translate('updatePrompt')}
                    confirmText={translate('updateApp')}
                    cancelText={translate('cancel')}
                />
            </>
        );
    }
}

BaseUpdateAppModal.propTypes = propTypes;
BaseUpdateAppModal.defaultProps = defaultProps;
export default withLocalize(BaseUpdateAppModal);
