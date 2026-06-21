import React from 'react';
import type {ReactNode} from 'react';
import {KeyboardAvoidingView, Modal, View} from 'react-native';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import resolveKeyboardBehavior from './resolveKeyboardBehavior';
import type {SheetKeyboardBehavior} from './resolveKeyboardBehavior/types';

type SheetProps = {
    // eslint-disable-next-line react/no-unused-prop-types -- cross-platform contract; the web variant consumes this to derive the portal z-index.
    kind: ModalKind;
    onRequestClose?: () => void;
    keyboardBehavior?: SheetKeyboardBehavior;
    children: ReactNode;
};

function Sheet({onRequestClose, keyboardBehavior, children}: SheetProps) {
    const inner = (
        <View
            accessibilityViewIsModal
            style={{flex: 1}}
        >
            {children}
        </View>
    );
    const resolvedBehavior = resolveKeyboardBehavior(keyboardBehavior);
    return (
        <Modal
            transparent
            animationType="none"
            visible
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={onRequestClose}
        >
            {resolvedBehavior === undefined ? (
                inner
            ) : (
                <KeyboardAvoidingView
                    behavior={resolvedBehavior}
                    style={{flex: 1}}
                >
                    {inner}
                </KeyboardAvoidingView>
            )}
        </Modal>
    );
}

export default Sheet;
