import React, {forwardRef} from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        initialNumToRender={20}

        // Remove clipped subviews helps prevent avatars and attachments from eating up excess memory on Android. When
        // we run out of memory images stop appearing without any warning.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        shouldRemoveClippedSubviews
    />
));
