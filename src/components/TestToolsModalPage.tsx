import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import Text from './Text';

function TestToolsModalPage() {
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const maxHeight = windowHeight;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[{maxHeight}, styles.h100, styles.defaultModalContainer, safeAreaPaddingBottomStyle]}>
                    <ScrollView
                        style={[styles.flex1, styles.ph5]}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <PressableWithoutFeedback
                            accessible={false}
                            style={[styles.cursorDefault]}
                            sentryLabel="TestToolsModalPage-ReleaseOptions"
                        >
                            <Text
                                style={[styles.textLabelSupporting, styles.mt5, styles.mb3]}
                                numberOfLines={1}
                            >
                                {translate('initialSettingsPage.troubleshoot.releaseOptions')}
                            </Text>
                            <TestToolMenu />
                        </PressableWithoutFeedback>
                    </ScrollView>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

export default TestToolsModalPage;
