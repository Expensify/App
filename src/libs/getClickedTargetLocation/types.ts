type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type GetClickedTargetLocation = (target: Element) => Pick<DOMRect, DOMRectProperties>;

export default GetClickedTargetLocation;
