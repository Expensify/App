import React, {useRef} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import {startSpan} from '@libs/telemetry/activeSpans';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import {useSearchRouterActions} from './SearchRouterContext';

type SearchButtonProps = {
    style?: StyleProp<ViewStyle>;
    shouldUseAutoHitSlop?: boolean;
};

function SearchButton({style, shouldUseAutoHitSlop = false}: SearchButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openSearchRouter} = useSearchRouterActions();
    const pressableRef = useRef<View>(null);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    const onPress = () => {
        callFunctionIfActionIsAllowed(() => {
            pressableRef.current?.blur();

            Performance.markStart(CONST.TIMING.OPEN_SEARCH);
            startSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER, {
                name: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
                op: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
            });

            openSearchRouter();
        })();
    };

    return (
        <Tooltip text={translate('common.search')}>
            <PressableWithoutFeedback
                ref={pressableRef}
                testID="searchButton"
                accessibilityLabel={translate('common.search')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                shouldUseAutoHitSlop={shouldUseAutoHitSlop}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SEARCH_BUTTON}
                onPress={onPress}
            >
                <Icon
                    src={expensifyIcons.MagnifyingGlass}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default SearchButton;
