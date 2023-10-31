import React, {ForwardedRef} from 'react';
import {ScrollView, ScrollViewProps, ViewStyle} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

type FormScrollViewProps = ScrollViewProps & {
    /** Form elements */
    children: React.ReactNode;
};

function FormScrollView({children, ...rest}: FormScrollViewProps, ref: ForwardedRef<ScrollView>) {
    const styles = useThemeStyles();
    return (
        <ScrollView
            style={[styles.w100 as ViewStyle, styles.flex1 as ViewStyle]}
            ref={ref}
            contentContainerStyle={styles.flexGrow1 as ViewStyle}
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
