import React, {useState, useEffect} from 'react';
import {Keyboard} from 'react-native';
import compose from '../../libs/compose';
import withKeyboardState from '../withKeyboardState';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';

function Modal(props) {
    const [isVisible, setIsVisible] = useState(false);

    // This closes the keyboard before opening the modal to avoid the issue where iOS automatically reopens
    // the keyboard if it was already open before any modals were opened. We manage the keyboard behaviour
    // explicitly at other places in the app to be consistent across all platforms
    useEffect(() => {
        if (!props.isVisible) {
            setIsVisible(false);
        } else if (props.isKeyboardShown) {
            const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
                setIsVisible(true);
                keyboardListener.remove();
            });
            Keyboard.dismiss();
        } else {
            setIsVisible(true);
        }
    }, [props.isVisible, props.isKeyboardShown]);

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVisible={isVisible}
        >
            {props.children}
        </BaseModal>
    );
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default compose(withWindowDimensions, withKeyboardState)(Modal);
