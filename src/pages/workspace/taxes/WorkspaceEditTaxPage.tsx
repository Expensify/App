import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type SCREENS from '@src/SCREENS';

type WorkspaceEditTaxPageBaseProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_EDIT>;

function WorkspaceEditTaxPage({
    route: {
        params: {taxID},
    },
    policy,
}: WorkspaceEditTaxPageBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentTaxRate = PolicyUtils.getTaxByID(policy, taxID);
    const {windowWidth} = useWindowDimensions();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const toggle = () => {
        // TODO: Backend call doesn't exist yet
        return;
        if (!policy?.id || !currentTaxRate) {
            return;
        }
        setPolicyTaxesEnabled(policy.id, [taxID], !currentTaxRate?.isDisabled);
    };

    const deleteTax = () => {
        if (!policy?.id) {
            return;
        }
        deletePolicyTaxes(policy?.id, [taxID]);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    const threeDotsMenuItems = useMemo(() => {
        const menuItems = [
            {
                icon: Expensicons.Trashcan,
                text: translate('common.delete'),
                onSelected: () => setIsDeleteModalVisible(true),
            },
        ];
        return menuItems;
    }, [translate]);

    return (
        <ScreenWrapper
            testID={WorkspaceEditTaxPage.displayName}
            style={styles.mb5}
        >
            <View style={[styles.h100, styles.flex1, styles.justifyContentBetween]}>
                <View>
                    <HeaderWithBackButton
                        title={currentTaxRate?.name}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldShowThreeDotsButton
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    />
                    {taxID ? (
                        // TODO: Extract it to a separate component or use a common one
                        <View style={[styles.flexRow, styles.mv4, styles.justifyContentBetween, styles.ph5]}>
                            <View style={styles.flex4}>
                                <Text>Enable rate</Text>
                            </View>
                            <View style={[styles.flex1, styles.alignItemsEnd]}>
                                <Switch
                                    accessibilityLabel="TODO"
                                    isOn={!currentTaxRate?.isDisabled}
                                    onToggle={toggle}
                                />
                            </View>
                        </View>
                    ) : null}
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={currentTaxRate?.name}
                        description={translate('common.name')}
                        style={[styles.moneyRequestMenuItem]}
                        titleStyle={styles.flex1}
                        onPress={() => {}}
                    />
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={currentTaxRate?.value}
                        description={translate('workspace.taxes.value')}
                        style={[styles.moneyRequestMenuItem]}
                        titleStyle={styles.flex1}
                        onPress={() => {}}
                    />
                </View>
            </View>
            <ConfirmModal
                title={translate('workspace.taxes.deleteTax')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteTax}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('workspace.taxes.deleteTaxConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ScreenWrapper>
    );
}

WorkspaceEditTaxPage.displayName = 'WorkspaceEditTaxPage';

export default withPolicyAndFullscreenLoading(WorkspaceEditTaxPage);
