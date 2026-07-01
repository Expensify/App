import type {RefObject} from 'react';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- cross-platform signature
function useAriaHideSiblings(containerRef: RefObject<AnchorNode | null>, isActive: boolean): void {}

export default useAriaHideSiblings;
