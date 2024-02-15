import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import withPaidPolicyAccessOrNotFound from './withPaidPolicyAccessOrNotFound';
import type {WithPaidPolicyAccessProps} from './withPaidPolicyAccessOrNotFound';

type PolicyForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
};

type WorkspaceCategoriesOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceCategoriesPageProps = WorkspaceCategoriesOnyxProps & WithPaidPolicyAccessProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({policyCategories}: WorkspaceCategoriesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categoryList = useMemo<PolicyForList[]>(
        () =>
            Object.values(policyCategories ?? {}).map((value) => ({
                value: value.name,
                text: value.name,
                keyForList: value.name,
                isSelected: selectedCategories.includes(value.name),
                rightElement: (
                    <View style={styles.flexRow}>
                        <Text style={[styles.disabledText, styles.alignSelfCenter]}>{value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}</Text>
                        <View style={[styles.p1, styles.pl2]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                            />
                        </View>
                    </View>
                ),
            })),
        [policyCategories, selectedCategories, styles.alignSelfCenter, styles.disabledText, styles.flexRow, styles.p1, styles.pl2, theme.icon, translate],
    );

    const toggleCategory = (category: PolicyForList) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category.value)) {
                return prev.filter((item) => item !== category.value);
            }
            return [...prev, category.value];
        });
    };

    const toggleAllCategories = () => {
        const isAllSelected = categoryList.every((category) => category.isSelected);
        if (isAllSelected) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categoryList.map((item) => item.value));
        }
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            style={[styles.defaultModalContainer]}
            testID={WorkspaceCategoriesPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                icon={Illustrations.FolderOpen}
                title={translate('workspace.common.categories')}
                shouldShowBackButton={isSmallScreenWidth}
            />
            <SelectionList
                canSelectMultiple
                sections={[{data: categoryList, indexOffset: 0, isDisabled: false}]}
                onSelectRow={toggleCategory}
                onSelectAll={toggleAllCategories}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default withPaidPolicyAccessOrNotFound()(
    withOnyx<WorkspaceCategoriesPageProps, WorkspaceCategoriesOnyxProps>({
        policyCategories: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
        },
    })(WorkspaceCategoriesPage),
);
