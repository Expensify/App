import {Text, View} from 'react-native';
import React from 'react';
import withLocalize from './withLocalize';
import Icon from './Icon';
import Colors from '../styles/colors';
import Styles from '../styles/styles';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

function TabSelectorItem(props) {
    return (
        <View>
            <PressableWithFeedback
                style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginHorizontal: 8,
                    alignItems: 'center',
                }}
                onPress={props.callback}
            >
                <Icon
                    src={props.icon}
                    fill={props.selected ? Colors.green : Colors.greenIcons}
                />
                <Text style={[props.selected ? Styles.textStrong : null, Styles.mt2, props.selected ? Styles.textWhite : Styles.colorMuted]}>{props.title}</Text>
            </PressableWithFeedback>
        </View>
    );
}

TabSelectorItem.displayName = 'TabSelectorItem';

export default withLocalize(TabSelectorItem);
