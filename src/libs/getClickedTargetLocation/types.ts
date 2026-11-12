type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type GetClickedTargetLocation = (target: unknown) => Pick<DOMRect, DOMRectProperties>;

export default GetClickedTargetLocation;
