import {View} from 'react-native';
import {ThemePreferenceWithoutSystem} from '@styles/themes/types';
import useThemePreferenceWithStaticOverride from '@styles/themes/useThemePreferenceWithStaticOverride';

export type CustomScrollbarWrapperProps = React.PropsWithChildren & {
    theme?: ThemePreferenceWithoutSystem;
};

export const CustomScrollbarWrapper: React.FC<CustomScrollbarWrapperProps> = ({children, theme: staticThemePreference}) => {
    const preferredTheme = useThemePreferenceWithStaticOverride(staticThemePreference);

    return <View style={{colorScheme: 'light', flex: 1}}>{children}</View>;
};
