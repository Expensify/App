import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type TableHeaderProps = {
    children: ReactNode;
};

function TableHeaderContainer({children}: TableHeaderProps) {
    const styles = useThemeStyles();

    return <View style={[styles.flexRow, styles.alignItemsCenter]}>{children}</View>;
}

export default TableHeaderContainer;
