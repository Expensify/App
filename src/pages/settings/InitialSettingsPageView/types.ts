// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

type InitialSettingsPageViewProps = {
    headerContent: React.JSX.Element;
    scrollViewRef: React.RefObject<RNScrollView | null>;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    accountMenuItems: React.JSX.Element;
    generalMenuItems: React.JSX.Element;
    shouldShowSignoutConfirmModal: boolean;
    toggleSignoutConfirmModal: (value: boolean) => void;
    signOut: (shouldForceSignout?: boolean) => Promise<void> | undefined;
};

export default InitialSettingsPageViewProps;
