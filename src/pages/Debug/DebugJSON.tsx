import React from 'react';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type DebugJSONProps = {
    data: Record<string, unknown>;
};

function DebugJSON({data}: DebugJSONProps) {
    const styles = useThemeStyles();
    return (
        <ScrollView style={styles.mt5}>
            <Text style={[styles.textLabel, styles.mh5, styles.mb5, styles.border, styles.p2]}>{JSON.stringify(data, null, 6)}</Text>
        </ScrollView>
    );
}

DebugJSON.displayName = 'DebugJSON';

export default DebugJSON;
