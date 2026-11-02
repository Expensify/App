import type {View} from 'react-native';

type SafeTriangleProps = {
    submenuRef: React.RefObject<View | null>;
    children: React.ReactNode;
};

export default SafeTriangleProps;
