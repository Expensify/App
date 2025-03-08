import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import BlockingView from './BlockingView';
import ForceFullScreenView from './ForceFullScreenView';

type FullPageErrorViewProps = {
    /** TestID for test */
    testID?: string;

    /** Child elements */
    children?: React.ReactNode;

    /** If true, child components are replaced with a blocking "error page" view */
    shouldShow?: boolean;

    /** The key in the translations file to use for the title */
    titleKey?: TranslationPaths;

    /** The key in the translations file to use for the subtitle. Pass an empty key to not show the subtitle. */
    subtitleKey?: TranslationPaths | '';

    /** Whether we should force the full page view */
    shouldForceFullScreen?: boolean;

    /** The style of the subtitle message */
    subtitleStyle?: StyleProp<TextStyle>;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageErrorView({
    testID,
    children = null,
    shouldShow = false,
    titleKey = 'pageError.title',
    subtitleKey = 'pageError.subtitle',
    shouldForceFullScreen = false,
    subtitleStyle,
}: FullPageErrorViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (shouldShow) {
        return (
            <ForceFullScreenView shouldForceFullScreen={shouldForceFullScreen}>
                <View
                    style={[styles.flex1, styles.blockingErrorViewContainer]}
                    testID={testID}
                >
                    <BlockingView
                        icon={Illustrations.BrokenMagnifyingGlass}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate(titleKey)}
                        subtitle={subtitleKey && translate(subtitleKey)}
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
