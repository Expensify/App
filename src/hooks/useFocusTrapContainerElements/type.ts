import type {View} from 'react-native';
import type ScrollView from '@components/ScrollView';

type FocusTrapContainerElement = HTMLElement | View | React.ElementRef<typeof ScrollView>;

type RemoveFocusTrapContainerElementFunc = () => void;

type RegisterFocusTrapContainerElementCallback = (container: FocusTrapContainerElement) => RemoveFocusTrapContainerElementFunc;

type UseFocusTrapContainerElements = () => [HTMLElement[], RegisterFocusTrapContainerElementCallback];

export type {UseFocusTrapContainerElements, RegisterFocusTrapContainerElementCallback, FocusTrapContainerElement};
