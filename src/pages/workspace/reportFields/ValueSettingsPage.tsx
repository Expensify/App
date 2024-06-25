import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setReportFieldsListValueEnabled} from '@libs/actions/WorkspaceReportFields';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ValueSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS>;

function ValueSettingsPage({route, navigation}: ValueSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = useState(false);

    const currentValue = formDraft?.listValues?.[route.params.valueName];

    useEffect(() => {
        if (currentValue?.name === route.params.valueName || !currentValue) {
            return;
        }
        navigation.setParams({valueName: currentValue?.name});
    }, [route.params.valueName, currentValue, navigation]);

    if (!currentValue) {
        return <NotFoundPage />;
    }

    const deleteListValueAndHideModal = () => {
        setIsDeleteTagModalOpen(false);
        Navigation.goBack();
    };

    const updateListValueEnabled = (value: boolean) => {
        setReportFieldsListValueEnabled(currentValue.name, value);
    };

    const navigateToEditValue = () => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_EDIT_VALUE.getRoute(route.params.policyID, currentValue.name));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={ValueSettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={currentValue.name}
                    shouldSetModalVisibility={false}
                />
                <ConfirmModal
                    title="Delete value"
                    isVisible={isDeleteTagModalOpen}
                    onConfirm={deleteListValueAndHideModal}
                    onCancel={() => setIsDeleteTagModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt="Are you sure that you want to delete this value?"
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <View style={styles.flexGrow1}>
                    <View style={[styles.mt2, styles.mh5]}>
                        <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text>{translate('workspace.tags.enableTag')}</Text>
                            <Switch
                                isOn={!currentValue.disabled}
                                accessibilityLabel="Enable value"
                                onToggle={updateListValueEnabled}
                            />
                        </View>
                    </View>
                    <MenuItemWithTopDescription
                        title={currentValue.name}
                        description={translate('common.value')}
                        onPress={navigateToEditValue}
                        shouldShowRightIcon
                    />
                    <MenuItem
                        icon={Expensicons.Trashcan}
                        title={translate('common.delete')}
                        onPress={() => setIsDeleteTagModalOpen(true)}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ValueSettingsPage.displayName = 'ValueSettingsPage';

export default ValueSettingsPage;
