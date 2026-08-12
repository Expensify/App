import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ThreadDividerProps = {
    /** Whether the thread divider should display a new marker */
    shouldDisplayNewMarker: boolean;
    /** Callback to be called on press */
    onPress?: () => void;
};

function ThreadDivider({shouldDisplayNewMarker, onPress}: ThreadDividerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Thread']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View
            style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mt3, styles.mb1, styles.userSelectNone]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            {onPress ? (
                <PressableWithoutFeedback
                    onPress={onPress}
                    accessibilityLabel={translate('threads.thread')}
                    role={CONST.ROLE.BUTTON}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.THREAD_DIVIDER}
                >
                    <Icon
                        src={icons.Thread}
                        fill={theme.link}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                    <Text style={[styles.threadDividerText, styles.link]}>{translate('threads.thread')}</Text>
                </PressableWithoutFeedback>
            ) : (
                <>
                    <Icon
                        src={icons.Thread}
                        fill={theme.icon}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                    <Text style={[styles.threadDividerText, styles.textSupporting, styles.ml1, styles.userSelectNone]}>{translate('threads.thread')}</Text>
                </>
            )}
            {!shouldDisplayNewMarker && <View style={[styles.threadDividerLine]} />}
        </View>
    );
}

export default ThreadDivider;
