import React, {createContext} from 'react';

type ImageBehaviorContextValue = {
    /**
     * Disable the logic to set aspect ratio of the container div based on the image aspect ratio.
     */
    doNotSetAspectRatio: boolean;
};

const ImageBehaviorContext = createContext<ImageBehaviorContextValue>({
    doNotSetAspectRatio: false,
});

const ImageBehaviorContextProvider = ({children, ...value}: {children: React.ReactNode} & ImageBehaviorContextValue) => {
    return <ImageBehaviorContext.Provider value={value}>{children}</ImageBehaviorContext.Provider>;
};

export {ImageBehaviorContext, ImageBehaviorContextProvider};
