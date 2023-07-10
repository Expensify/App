import {View} from 'react-native';
import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import withLocalize from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import lodashGet from 'lodash/get';

function TabSelector(props) {
    const selectedTab = lodashGet(props.tabSelected, 'selected', 'manual');
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TabSelectorItem
                title="Manual"
                selected={selectedTab === 'manual'}
                icon={Expensicons.Pencil}
                callback={() => {
                    Onyx.merge(ONYXKEYS.TAB_SELECTOR, {selected: 'manual'});
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={selectedTab === 'scan'}
                icon={Expensicons.Receipt}
                callback={() => {
                    Onyx.merge(ONYXKEYS.TAB_SELECTOR, {selected: 'scan'});
                }}
            />
        </View>
    );
}

TabSelector.displayName = 'TabSelector';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        tabSelected: {key: ONYXKEYS.TAB_SELECTOR},
    }),
)(TabSelector);
