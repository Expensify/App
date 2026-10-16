import type {ComponentRef} from 'react';
import type {View} from 'react-native';

type FocusElement = (element: ComponentRef<typeof View> | null | undefined) => void;

export default FocusElement;
