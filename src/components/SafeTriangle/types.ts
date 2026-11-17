import type {ComponentRef} from 'react';
import type {View} from 'react-native';

type SafeTriangleProps = {
    submenuRef: React.RefObject<ComponentRef<typeof View> | null>;
    children: React.ReactNode;
};

export default SafeTriangleProps;
