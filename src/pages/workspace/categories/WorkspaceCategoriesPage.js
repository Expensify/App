import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicyAccessOrNotFound from './withPolicyAccessOrNotFound';

const propTypes = {
    ...windowDimensionsPropTypes,
};

function WorkspaceCategoriesPage({policyCategories}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedCategories, setSelectedCategories] = useState([]);

    const data = useMemo(
        () =>
            _.map(_.values(policyCategories), (value) => ({
                value: value.name,
                text: value.name,
                keyForList: value.name,
                isSelected: selectedCategories.includes(value.name),
                rightElement: (
                    <View style={styles.flexRow}>
                        <Text style={[styles.disabledText, styles.alignSelfCenter]}>{value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}</Text>
                        <View style={styles.p1}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                            />
                        </View>
                    </View>
                ),
            })),
        [policyCategories, selectedCategories, styles.alignSelfCenter, styles.disabledText, styles.flexRow, styles.p1, theme.icon, translate],
    );

    const toggleCategory = (category) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category.value)) {
                return _.filter(prev, (item) => item !== category.value);
            }
            return [...prev, category.value];
        });
    };

    const toggleAllCategories = () => {
        const isAllSelected = _.every(data, (category) => category.isSelected);
        if (isAllSelected) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(_.map(data, (item) => item.value));
        }
    };

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                icon={Illustrations.FolderOpen}
                title={translate('workspace.common.categories')}
                shouldShowBackButton={isSmallScreenWidth}
            />
            <SelectionList
                canSelectMultiple
                sections={[{data, indexOffset: 0, isDisabled: false}]}
                onSelectRow={toggleCategory}
                onSelectAll={toggleAllCategories}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

WorkspaceCategoriesPage.propTypes = propTypes;

export default compose(
    withPolicyAccessOrNotFound(),
    withWindowDimensions,
    withOnyx({
        policyCategories: {
            key: ({
                route: {
                    params: {policyID},
                },
            }) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
        },
    }),
)(WorkspaceCategoriesPage);
