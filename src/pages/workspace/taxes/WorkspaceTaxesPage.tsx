import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import type SCREENS from '@src/SCREENS';

type PolicyForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
};

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({policy}: WorkspaceTaxesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);

    const taxesList = useMemo<PolicyForList[]>(
        () =>
            Object.entries(policy?.taxRates?.taxes ?? {}).map(([key, value]) => ({
                value: value.name,
                text: value.name,
                keyForList: key,
                isSelected: !!selectedTaxesIDs.includes(key),
                rightElement: (
                    <View style={styles.flexRow}>
                        <Text style={[styles.disabledText, styles.alignSelfCenter]}>{value.isDisabled ? translate('workspace.common.disabled') : translate('workspace.common.enabled')}</Text>
                        <View style={[styles.p1, styles.pl2]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                            />
                        </View>
                    </View>
                ),
            })),
        [policy?.taxRates?.taxes, selectedTaxesIDs, styles, theme.icon, translate],
    );

    const toggleTax = (tax: PolicyForList) => {
        setSelectedTaxesIDs((prev) => {
            if (prev.includes(tax.keyForList)) {
                return prev.filter((item) => item !== tax.keyForList);
            }
            return [...prev, tax.keyForList];
        });
    };

    const toggleAllTaxes = () => {
        setSelectedTaxesIDs((prev) => {
            if (prev.length === taxesList.length) {
                return [];
            }

            return taxesList.map((item) => item.keyForList);
        });
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policy?.id ?? ''}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policy?.id ?? ''}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceTaxesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.Coins}
                        title={translate('workspace.common.taxes')}
                        shouldShowBackButton={isSmallScreenWidth}
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.taxes.subtitle')}</Text>
                    </View>
                    <SelectionList
                        canSelectMultiple
                        sections={[{data: taxesList, indexOffset: 0, isDisabled: false}]}
                        onCheckboxPress={toggleTax}
                        onSelectRow={() => {}}
                        onSelectAll={toggleAllTaxes}
                        showScrollIndicator
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesPage.displayName = 'WorkspaceTaxesPage';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
