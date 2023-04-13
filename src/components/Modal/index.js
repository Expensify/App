import React, {Component} from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';

class Modal extends Component {
    constructor(props) {
        super(props);
        this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
    }

    componentDidMount() {
        if (!this.props.shouldCloseOnOutsideClick) {
            return;
        }

        document.addEventListener('mousedown', this.closeOnOutsideClick);
    }

    componentWillUnmount() {
        if (!this.props.shouldCloseOnOutsideClick) {
            return;
        }

        document.removeEventListener('mousedown', this.closeOnOutsideClick);
    }

    closeOnOutsideClick(event) {
        if (!this.props.isVisible || !this.baseModalRef || this.baseModalRef.contains(event.target) || !this.props.shouldCloseOnOutsideClick) {
            return;
        }

        this.props.onClose();
    }

    render() {
        return (
            <BaseModal
                ref={(el) => (this.baseModalRef = el)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            >
                {this.props.children}
            </BaseModal>
        );
    }
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;

export default withWindowDimensions(Modal);
