import type {EventConsumer} from '@react-navigation/native';
import type {NativeStackNavigationEventMap} from '@react-navigation/native-stack';

type StackStateLike = {
    routes: Array<{key: string; name: string}>;
};

type UseReportTabRootRevealing = (state: StackStateLike, descriptors: Record<string, {navigation: EventConsumer<NativeStackNavigationEventMap>} | undefined>) => void;

export default UseReportTabRootRevealing;
