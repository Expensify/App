import React from 'react';
import {View} from 'react-native';
import {FormSubmitProps, FormSubmitRef} from './types';

function FormSubmit({style, children}: FormSubmitProps, ref: FormSubmitRef) {
    return (
        <View
            ref={ref}
            style={style}
        >
            {children}
        </View>
    );
}

FormSubmit.displayName = 'FormSubmit';

export default React.forwardRef(FormSubmit);
