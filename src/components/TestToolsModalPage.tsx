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

type TestToolsModalPageProps = PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, typeof SCREENS.TEST_TOOLS_MODAL.ROOT>;

function TestToolsModalPage({route}: TestToolsModalPageProps) {
    const styles = useThemeStyles();

    return (
        <TestToolsScreenWrapper>
            <ScrollView
                style={[styles.flex1, styles.ph5]}
                contentContainerStyle={styles.flexGrow1}
            >
                <PressableWithoutFeedback
                    accessible={false}
                    style={[styles.cursorDefault, styles.mt5]}
                    sentryLabel="TestToolsModalPage-ReleaseOptions"
                >
                    <TestToolMenu serverPageRoute={ROUTES.TEST_TOOLS_SERVER.getRoute(route.params?.backTo)} />
                </PressableWithoutFeedback>
            </ScrollView>
        </TestToolsScreenWrapper>
    );
}

export default TestToolsModalPage;
