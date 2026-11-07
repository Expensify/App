import type {EventConsumer} from '@react-navigation/native';
import type {NativeStackNavigationEventMap} from '@react-navigation/native-stack';

// Typed by hand because the platform stack's `PlatformSpecificEventMap` is set to an options type, so its events would
// carry no `closing` data.
type StackStateLike = {
    routes: Array<{key: string; name: string}>;
};

type UseReportTabRootRevealing = (state: StackStateLike, descriptors: Record<string, {navigation: EventConsumer<NativeStackNavigationEventMap>} | undefined>) => void;

export default UseReportTabRootRevealing;
