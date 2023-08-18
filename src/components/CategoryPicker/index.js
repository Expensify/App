import React, {useMemo} from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import OptionsList from '../OptionsList';
import styles from '../../styles/styles';
import ScreenWrapper from '../ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

function CategoryPicker({policyCategories, reportID, iouType}) {
    const sections = useMemo(() => {
        const categoryList = _.chain(policyCategories)
            .values()
            .map((category) => ({
                text: category.name,
                keyForList: category.name,
                tooltipText: category.name,
            }))
            .value();

        return [
            {
                data: categoryList,
            },
        ];
    }, [policyCategories]);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <OptionsList
                    optionHoveredStyle={styles.hoveredComponentBG}
                    contentContainerStyles={[safeAreaPaddingBottomStyle]}
                    sections={sections}
                    onSelectRow={navigateBack}
                />
            )}
        </ScreenWrapper>
    );
}

CategoryPicker.displayName = 'CategoryPicker';
CategoryPicker.propTypes = propTypes;
CategoryPicker.defaultProps = defaultProps;

export default withOnyx({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
})(CategoryPicker);
