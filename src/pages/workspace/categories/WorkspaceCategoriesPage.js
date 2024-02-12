import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import categoryPropTypes from '@components/categoryPropTypes';
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
import compose from '@libs/compose';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicyAccessOrNotFound from './withPolicyAccessOrNotFound';

const propTypes = {
    /* Onyx Props */
    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/categories */
            policyID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    policyCategories: {},
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
WorkspaceCategoriesPage.defaultProps = defaultProps;
WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default compose(
    withPolicyAccessOrNotFound(),
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
