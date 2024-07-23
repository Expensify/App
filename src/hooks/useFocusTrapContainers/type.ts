import type {View} from 'react-native';
import type ScrollView from '@components/ScrollView';

type FocusTrapContainerElement = HTMLElement | View | React.ElementRef<typeof ScrollView>;

type RemoveFocusTrapContainerFunction = () => void;

type RegisterFocusTrapContainerCallback = (container: FocusTrapContainerElement) => RemoveFocusTrapContainerFunction;

type UseFocusTrapContainers = () => [HTMLElement[], RegisterFocusTrapContainerCallback];

export type {UseFocusTrapContainers, RegisterFocusTrapContainerCallback, FocusTrapContainerElement};
