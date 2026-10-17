import type {ContinueActionParams} from '@components/KYCWall/types';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

type DOMRectProperties = 'top' | 'bottom' | 'left' | 'right' | 'height' | 'x' | 'y';

type GetClickedTargetLocation = (target: ComponentRef<typeof View> | NonNullable<ContinueActionParams['event']>['currentTarget'] | null | undefined) => Pick<DOMRect, DOMRectProperties>;

export default GetClickedTargetLocation;
