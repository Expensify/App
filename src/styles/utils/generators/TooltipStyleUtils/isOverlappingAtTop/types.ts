import type {ComponentRef} from 'react';
import type {View} from 'react-native';

type IsOverlappingAtTop = (tooltip: ComponentRef<typeof View> | HTMLDivElement, xOffset: number, yOffset: number, tooltipTargetWidth: number, tooltipTargetHeight: number) => boolean;

export default IsOverlappingAtTop;
