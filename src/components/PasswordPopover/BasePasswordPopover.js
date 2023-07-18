import {View} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Text from '../Text';
import Popover from '../Popover';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useLocalize from '../../hooks/useLocalize';
import TextInput from '../TextInput';
import KeyboardSpacer from '../KeyboardSpacer';
import {propTypes as passwordPopoverPropTypes, defaultProps as passwordPopoverDefaultProps} from './passwordPopoverPropTypes';
import Button from '../Button';
import withViewportOffsetTop from '../withViewportOffsetTop';
import CONST from '../../CONST';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    ...passwordPopoverPropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    ...passwordPopoverDefaultProps,
};

function BasePasswordPopover({isVisible, onClose, anchorPosition, viewportOffsetTop, shouldDelayFocus, onSubmit, submitButtonText}) {
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [password, setPassword] = useState('');
    const passwordInput = useRef(null);

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setPassword('');
    }, [isVisible]);

    /**
     * Focus the password input
     */
    const focusInput = () => {
        if (!passwordInput.current) {
            return;
        }
        passwordInput.current.focus();
    };

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            onModalShow={focusInput}
            outerStyle={{maxHeight: windowHeight, marginTop: viewportOffsetTop}}
        >
            <View style={[styles.m5, !isSmallScreenWidth ? styles.sidebarPopover : '']}>
                <Text style={[styles.mb3]}>{translate('passwordForm.pleaseFillPassword')}</Text>
                <TextInput
                    label={translate('common.password')}
                    accessibilityLabel={translate('common.password')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    ref={passwordInput}
                    secureTextEntry
                    autoCompleteType="password"
                    textContentType="password"
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={() => onSubmit(password)}
                    style={styles.mt3}
                    autoFocus
                    shouldDelayFocus={shouldDelayFocus}
                />
                <Button
                    onPress={() => onSubmit(password)}
                    style={styles.mt3}
                    text={submitButtonText}
                />
            </View>
            <KeyboardSpacer />
        </Popover>
    );
}

BasePasswordPopover.propTypes = propTypes;
BasePasswordPopover.defaultProps = defaultProps;
BasePasswordPopover.displayName = 'BasePasswordPopover';
export default withViewportOffsetTop(BasePasswordPopover);
