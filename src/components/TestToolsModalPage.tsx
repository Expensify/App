import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolsScreenWrapper from './TestToolsScreenWrapper';
import Text from './Text';

type TestToolsModalPageProps = PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, typeof SCREENS.TEST_TOOLS_MODAL.ROOT>;

function TestToolsModalPage({route}: TestToolsModalPageProps) {
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
                    <TestToolMenu serverPageRoute={ROUTES.TEST_TOOLS_SERVER.getRoute(route.params?.backTo)} />
                </PressableWithoutFeedback>
            </ScrollView>
        </TestToolsScreenWrapper>
    );
}

export default TestToolsModalPage;
