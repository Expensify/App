import type {ComponentRef, ReactNode, Ref} from 'react';
import type {View} from 'react-native';

type NoDropZoneProps = {
    children: ReactNode;

    /** The zone's element on web. Never set on native, where the zone renders no element. */
    ref?: Ref<ComponentRef<typeof View> | HTMLElement>;
};

export default NoDropZoneProps;
