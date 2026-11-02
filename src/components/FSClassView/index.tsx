import type {FSClass} from '@libs/Fullstory/types';

import type {Ref} from 'react';
import type {ViewProps} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import FSClassContext from './FSClassContext';

type FSClassViewProps = ViewProps & {
    /** FullStory class applied to this view and handed to the text inputs inside it. Without one, the view keeps the class of the `FSClassView` above */
    forwardedFSClass?: FSClass;

    /** Reference to the underlying view */
    ref?: Ref<View>;
};

/**
 * A `View` that masks or unmasks everything inside it in FullStory. Use it instead of `<View fsClass>` around
 * sensitive content: text inputs inside pick up its class, so they can't unmask themselves.
 */
function FSClassView({forwardedFSClass, children, ...props}: FSClassViewProps) {
    if (!forwardedFSClass) {
        return <View {...props}>{children}</View>;
    }

    return (
        <FSClassContext.Provider value={forwardedFSClass}>
            <View
                {...props}
                fsClass={forwardedFSClass}
            >
                {children}
            </View>
        </FSClassContext.Provider>
    );
}

export default FSClassView;
export type {FSClassViewProps};
