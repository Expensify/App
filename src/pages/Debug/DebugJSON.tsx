import React from 'react';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import Clipboard from '@libs/Clipboard';

type DebugJSONProps = {
    data: Record<string, unknown>;
};

function DebugJSON({data}: DebugJSONProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();
    const json = JSON.stringify(data, null, 6);
    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5]}
        >
            <Button
                // success
                isDisabled={!isThrottledButtonActive}
                text={isThrottledButtonActive ? translate('reportActionContextMenu.copyOnyxData') : translate('reportActionContextMenu.copied')}
                onPress={() => {
                    Clipboard.setString(json);
                    setThrottledButtonInactive();
                }}
                icon={Expensicons.Copy}
            />
            <Text style={[styles.textLabel, styles.mb5, styles.border, styles.p2]}>{json}</Text>
        </ScrollView>
    );
}

DebugJSON.displayName = 'DebugJSON';

export default DebugJSON;
