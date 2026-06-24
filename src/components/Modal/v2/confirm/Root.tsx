import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useDialogVariant from '@components/Modal/v2/compound/useDialogVariant';
import type {DialogVariantHint} from '@components/Modal/v2/compound/useDialogVariant';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {ConfirmContext} from './context';

type RootProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onBackdropPress?: () => void;
    onExitComplete?: () => void;
    innerStyle?: StyleProp<ViewStyle>;
    variant?: DialogVariantHint;
    children: ReactNode;
};

function Root({isOpen, onConfirm, onCancel, onBackdropPress, onExitComplete, innerStyle, variant = 'auto', children}: RootProps) {
    const styles = useThemeStyles();
    const Variant = useDialogVariant(variant);

    const handleOpenChange = (open: boolean) => {
        if (open) {
            return;
        }
        onCancel();
    };

    return (
        <ConfirmContext value={{state: {isOpen}, actions: {confirm: onConfirm, cancel: onCancel}}}>
            <Variant.Root
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
            >
                <Variant.Content
                    onExitComplete={onExitComplete}
                    onBackdropPress={onBackdropPress ?? onCancel}
                    innerStyle={[styles.pv0, innerStyle]}
                    role={CONST.ROLE.ALERTDIALOG}
                >
                    <View style={styles.m5}>{children}</View>
                </Variant.Content>
            </Variant.Root>
        </ConfirmContext>
    );
}

export default Root;
export type {RootProps};
