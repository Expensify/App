import {View} from 'react-native';
import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import withLocalize from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';

function TabSelector(props) {
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TabSelectorItem
                title="Manual"
                selected={props.tabSelected.selected === 'manual'}
                icon={Expensicons.Pencil}
                callback={() => {
                    Onyx.merge(ONYXKEYS.TAB_SELECTOR, {selected: 'manual'});
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={props.tabSelected.selected === 'scan'}
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
