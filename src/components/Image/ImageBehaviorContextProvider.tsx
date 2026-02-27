import React, {createContext} from 'react';

type ImageBehaviorContextValue = {
    /**
     * Determine whether or not to set the aspect ratio of the container div based on the image's aspect ratio.
     */
    shouldSetAspectRatioInStyle: boolean;
};

const ImageBehaviorContext = createContext<ImageBehaviorContextValue>({
    shouldSetAspectRatioInStyle: true,
});

function ImageBehaviorContextProvider({children, ...value}: {children: React.ReactNode} & ImageBehaviorContextValue) {
    return <ImageBehaviorContext.Provider value={value}>{children}</ImageBehaviorContext.Provider>;
}

export {ImageBehaviorContext, ImageBehaviorContextProvider};
