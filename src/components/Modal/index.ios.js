import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
import {compose} from 'underscore';
import withKeyboardState from '../withKeyboardState';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';

const Modal = (props) => {
    const [isVisible, setIsVisible] = useState(false);

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
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default compose(withWindowDimensions, withKeyboardState)(Modal);
