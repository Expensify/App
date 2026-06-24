import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type ActionsProps = {
    children: ReactNode;
};

function Actions({children}: ActionsProps) {
    const styles = useThemeStyles();
    return <View style={styles.mt4}>{children}</View>;
}

export default Actions;
export type {ActionsProps};
