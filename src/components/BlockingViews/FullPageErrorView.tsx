import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
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
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageErrorView({testID, children = null, shouldShow = false, title = '', subtitle = '', shouldForceFullScreen = false, subtitleStyle}: FullPageErrorViewProps) {
    const styles = useThemeStyles();

    if (shouldShow) {
        return (
            <ForceFullScreenView shouldForceFullScreen={shouldForceFullScreen}>
                <View
                    style={[styles.flex1, styles.blockingErrorViewContainer]}
                    testID={testID}
                >
                    <BlockingView
                        icon={Illustrations.BrokenMagnifyingGlass}
                        iconWidth={variables.errorPageIconWidth}
                        iconHeight={variables.errorPageIconHeight}
                        title={title}
                        subtitle={subtitle}
                        subtitleStyle={subtitleStyle}
                    />
                </View>
            </ForceFullScreenView>
        );
    }

    return children;
}

FullPageErrorView.displayName = 'FullPageErrorView';

export type {FullPageErrorViewProps};
export default FullPageErrorView;
