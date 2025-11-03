import type {ForwardedRef} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from './ScrollView';

type FormScrollViewProps = ScrollViewProps & {
    /** Form elements */
    children: React.ReactNode;
};

function FormScrollView({children, ...rest}: FormScrollViewProps, ref: ForwardedRef<RNScrollView>) {
    const styles = useThemeStyles();
    return (
        <ScrollView
            style={[styles.w100, styles.flex1]}
            ref={ref}
            contentContainerStyle={styles.flexGrow1}
            keyboardShouldPersistTaps="handled"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </ScrollView>
    );
}

FormScrollView.displayName = 'FormScrollView';

export default React.forwardRef(FormScrollView);
