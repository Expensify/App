type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type GetClickedTargetLocation = (target: HTMLDivElement) => Pick<DOMRect, DOMRectProperties>;

export default GetClickedTargetLocation;
