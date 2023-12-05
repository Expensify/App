import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';

type WorkspacesListRowProps = {
    title: string;
};

function WorkspacesListRow({title}: WorkspacesListRowProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.highlightBG, styles.p5, styles.br3]}>
            <Text>{title}</Text>
        </View>
    );
}

export default WorkspacesListRow;
