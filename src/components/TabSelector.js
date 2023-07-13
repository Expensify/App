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

const TAB_MANUAL = 'manual';
const TAB_SCAN = 'scan';

const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,
};

const defaultProps = {
    tabSelected: TAB_MANUAL,
};

function TabSelector(props) {
    const selectedTab = lodashGet(props.tabSelected, 'selected', TAB_MANUAL);
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TabSelectorItem
                title="Manual"
                selected={selectedTab === TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    Tab.onTabPress(TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={selectedTab === TAB_SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    Tab.onTabPress(TAB_SCAN);
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
