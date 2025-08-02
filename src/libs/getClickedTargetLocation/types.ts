type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type GetClickedTargetLocation = (target: HTMLDivElement) => Pick<DOMRect, DOMRectProperties>;

// New types added for coverage testing
type ClickPosition = {
    x: number;
    y: number;
};

type ElementDimensions = {
    width: number;
    height: number;
};

type TargetLocationInfo = {
    position: ClickPosition;
    dimensions: ElementDimensions;
    element: HTMLElement;
    timestamp: number;
};

type LocationCalculator = (element: HTMLElement, clickEvent: MouseEvent) => TargetLocationInfo;

export default GetClickedTargetLocation;
export type {ClickPosition, ElementDimensions, TargetLocationInfo, LocationCalculator};
