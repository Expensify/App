import type {View} from 'react-native';

type IsOverlappingAtTop = (tooltip: View | HTMLDivElement, xOffset: number, yOffset: number, tooltipTargetWidth: number, tooltipTargetHeight: number) => boolean;

export default IsOverlappingAtTop;
