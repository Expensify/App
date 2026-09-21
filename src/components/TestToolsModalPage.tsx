import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import ROUTES from '@src/ROUTES';

import React from 'react';

import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolsScreenWrapper from './TestToolsScreenWrapper';
import Text from './Text';

function TestToolsModalPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <TestToolsScreenWrapper>
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
                    <TestToolMenu serverPageRoute={ROUTES.TEST_TOOLS_SERVER} />
                </PressableWithoutFeedback>
            </ScrollView>
        </TestToolsScreenWrapper>
    );
}

export default TestToolsModalPage;
