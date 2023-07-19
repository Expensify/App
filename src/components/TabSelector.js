import {View} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import withLocalize from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import Tab from '../libs/actions/Tab';
import CONST from '../CONST';

const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,
};

const defaultProps = {
    tabSelected: CONST.TAB.TAB_MANUAL,
};

function TabSelector(props) {
    const selectedTab = props.tabSelected ? props.tabSelected : CONST.TAB.TAB_MANUAL;
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20}}>
            <TabSelectorItem
                title="Manual"
                selected={selectedTab === CONST.TAB.TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    Tab.onTabPress(CONST.TAB.TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={selectedTab === CONST.TAB.TAB_SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    Tab.onTabPress(CONST.TAB.TAB_SCAN);
                }}
            />
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default compose(
    withLocalize,
    withOnyx({
        tabSelected: {
            key: ONYXKEYS.TAB_SELECTOR,
        },
    }),
)(TabSelector);
