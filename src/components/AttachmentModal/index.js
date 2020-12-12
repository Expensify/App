import React, {Component} from 'react';
import AttachmentModalBase from './AttachmentModalBase';
import propTypes from './attachmentModalPropTypes';

const defaultProps = {
    sourceURL: null,
    isAuthTokenRequired: false,
};

class AttachmentModal extends Component {
    constructor(props) {
        super(props);
        this.modalRef = React.createRef();

        this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    }

    componentDidMount() {
        document.onkeyup = this.handleKeyboardEvent;
    }

    handleKeyboardEvent(e) {
        if (!e) {
            return;
        }

        e.preventDefault();

        if (e.key === 'Enter') {
            this.modalRef.current.confirmAndClose();
        }

        if (e.key === 'Escape') {
            this.modalRef.current.close();
        }
    }

    render() {
        return (
            <AttachmentModalBase
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.modalRef}
            >
                {this.props.children}
            </AttachmentModalBase>
        );
    }
}

AttachmentModal.propTypes = propTypes;
AttachmentModal.defaultProps = defaultProps;
AttachmentModal.displayName = 'AttachmentModal';

export default AttachmentModal;
