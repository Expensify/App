import React from 'react';
import type {ReactNode} from 'react';
import useDialogVariant from '@components/Modal/v2/compound/useDialogVariant';
import type {DialogVariantHint} from '@components/Modal/v2/compound/useDialogVariant';
import ScrollView from '@components/ScrollView';
import useThemeStyles from '@hooks/useThemeStyles';

type RootProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onExitComplete?: () => void;
    variant?: DialogVariantHint;
    children: ReactNode;
};

function Root({isOpen, onOpenChange, onExitComplete, variant = 'auto', children}: RootProps) {
    const styles = useThemeStyles();
    const Variant = useDialogVariant(variant);

    return (
        <Variant.Root
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Variant.Content
                onExitComplete={onExitComplete}
                innerStyle={styles.pv0}
            >
                <ScrollView contentContainerStyle={styles.p5}>{children}</ScrollView>
            </Variant.Content>
        </Variant.Root>
    );
}

export default Root;
export type {RootProps};
