type WindowDimensions = {
    windowWidth: number;
    windowHeight: number;
};

type UseWindowDimensions = (shouldUseCachedViewportHeight?: boolean) => WindowDimensions;

export default WindowDimensions;
export type {UseWindowDimensions};
