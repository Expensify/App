import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import {GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable} from 'expo-glass-effect';

type HeaderBackButtonGlassProps = {
    /** Back button rendered on the glass surface. */
    children: ReactNode;
};

function HeaderBackButtonGlass({children}: HeaderBackButtonGlassProps) {
    const styles = useThemeStyles();

    if (!isLiquidGlassAvailable() || !isGlassEffectAPIAvailable()) {
        return children;
    }

    return (
        <GlassView
            style={styles.headerBackButtonGlass}
            glassEffectStyle="clear"
            isInteractive
        >
            {children}
        </GlassView>
    );
}

export default HeaderBackButtonGlass;
