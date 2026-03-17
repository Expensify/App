// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

type ScrollToTabProps = {
    animated?: boolean;
    containerRef: React.RefObject<RNScrollView | null>;
    containerX: number;
    containerWidth: number;
    tabX: number;
    tabWidth: number;
};

// eslint-disable-next-line import/prefer-default-export
export type {ScrollToTabProps};
