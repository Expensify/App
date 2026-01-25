import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import SwipeInterceptPanResponder from '@components/SwipeInterceptPanResponder';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import Clipboard from '@libs/Clipboard';
import DebugUtils from '@libs/DebugUtils';

type DebugJSONProps = {
    /** The JSON data to be previewed. */
    data: Record<string, unknown>;
};

function DebugJSON({data}: DebugJSONProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Copy'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isThrottledButtonActive, setThrottledButtonInactive] = useThrottledButtonState();

    const json = useMemo(() => DebugUtils.stringifyJSON(data), [data]);

    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5]}
        >
            <Button
                isDisabled={!isThrottledButtonActive}
                text={isThrottledButtonActive ? translate('reportActionContextMenu.copyOnyxData') : translate('reportActionContextMenu.copied')}
                onPress={() => {
                    Clipboard.setString(json);
                    setThrottledButtonInactive();
                }}
                icon={icons.Copy}
            />
            <View
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...SwipeInterceptPanResponder.panHandlers}
            >
                <Text style={[styles.textLabel, styles.mb5, styles.border, styles.p2]}>{json}</Text>
            </View>
        </ScrollView>
    );
}

export default DebugJSON;
