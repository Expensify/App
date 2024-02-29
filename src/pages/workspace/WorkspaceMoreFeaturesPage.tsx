import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import AdminPolicyAccessOrNotFoundWrapper from './AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from './PaidPolicyAccessOrNotFoundWrapper';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

type WorkspaceMoreFeaturesPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

type FeatureForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

function WorkspaceMoreFeaturesPage({route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const featureList = useMemo<FeatureForList[]>(
        () =>
            [].map((name, index) => ({
                // ['Feature 1', 'Feature 2', 'Feature 3'].map((name, index) => ({
                value: name,
                text: name,
                keyForList: name,
                isSelected: index % 2 === 0,
            })),
        [],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceMoreFeaturesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.FolderOpen}
                        title={translate('workspace.common.moreFeatures')}
                        shouldShowBackButton={isSmallScreenWidth}
                    />

                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>Page subtitle...</Text>
                    </View>

                    {featureList.length ? (
                        <FlatList
                            style={styles.flex1}
                            contentContainerStyle={[styles.pl3, styles.pr9]}
                            keyExtractor={(item) => item.keyForList}
                            data={featureList}
                            renderItem={({item}) => (
                                <ToggleSettingOptionRow
                                    icon={Illustrations.FolderOpen}
                                    title={item.text}
                                    subtitle={item.text}
                                    onToggle={() => {}}
                                    isActive={false}
                                />
                            )}
                        />
                    ) : (
                        <WorkspaceEmptyStateSection
                            title="Empty features title"
                            icon={Illustrations.EmptyStateExpenses}
                            subtitle="Empty features subtitle"
                        />
                    )}
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default WorkspaceMoreFeaturesPage;
