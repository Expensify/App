import React, {useRef} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import {startSpan} from '@libs/telemetry/activeSpans';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import {useSearchRouterContext} from './SearchRouterContext';

type SearchButtonProps = {
    style?: StyleProp<ViewStyle>;
    shouldUseAutoHitSlop?: boolean;
};

function SearchButton({style, shouldUseAutoHitSlop = false}: SearchButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openSearchRouter} = useSearchRouterContext();
    const pressableRef = useRef<View>(null);

    return (
        <Tooltip text={translate('common.search')}>
            <PressableWithoutFeedback
                ref={pressableRef}
                testID="searchButton"
                accessibilityLabel={translate('common.search')}
                style={[styles.flexRow, styles.touchableButtonImage, style]}
                shouldUseAutoHitSlop={shouldUseAutoHitSlop}
                // eslint-disable-next-line react-compiler/react-compiler
                onPress={callFunctionIfActionIsAllowed(() => {
                    pressableRef?.current?.blur();

                    Timing.start(CONST.TIMING.OPEN_SEARCH);
                    Performance.markStart(CONST.TIMING.OPEN_SEARCH);
                    startSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER, {
                        name: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
                        op: CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
                    });

                    openSearchRouter();
                })}
            >
                <Icon
                    src={Expensicons.MagnifyingGlass}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

SearchButton.displayName = 'SearchButton';

export default SearchButton;
