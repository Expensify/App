import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import BlockingView from './BlockingView';
import ForceFullScreenView from './ForceFullScreenView';

type FullPageErrorViewProps = {
    /** TestID for test */
    testID?: string;

    /** Child elements */
    children?: React.ReactNode;

    /** If true, child components are replaced with a blocking "error page" view */
    shouldShow?: boolean;

    /** The title text to be displayed */
    title?: string;

    /** The subtitle text to be displayed */
    subtitle?: string;

    /** Whether we should force the full page view */
    shouldForceFullScreen?: boolean;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;

    containerStyle?: StyleProp<ViewStyle>;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageErrorView({testID, children = null, shouldShow = false, title = '', subtitle = '', shouldForceFullScreen = false, subtitleStyle, containerStyle}: FullPageErrorViewProps) {
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);

    if (shouldShow) {
        return (
            <ForceFullScreenView shouldForceFullScreen={shouldForceFullScreen}>
                <View
                    style={[styles.flex1, styles.searchBlockingErrorViewContainer]}
                    testID={testID}
                >
                    <BlockingView
                        icon={illustrations.BrokenMagnifyingGlass}
                        iconWidth={variables.errorPageIconWidth}
                        iconHeight={variables.errorPageIconHeight}
                        title={title}
                        subtitle={subtitle}
                        subtitleStyle={subtitleStyle}
                        containerStyle={containerStyle}
                    />
                </View>
            </ForceFullScreenView>
        );
    }

    return children;
}

export type {FullPageErrorViewProps};
export default FullPageErrorView;
