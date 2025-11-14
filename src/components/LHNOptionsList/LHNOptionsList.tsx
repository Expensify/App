/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {useRoute} from '@react-navigation/native';
import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import type {BlockingViewProps} from '@components/BlockingViews/BlockingView';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import TextBlock from '@components/TextBlock';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRow';
import OptionRowRendererComponent from './OptionRowRendererComponent';
import type {LHNOptionsListProps, RenderItemProps} from './types';
import useEmptyLHNIllustration from './useEmptyLHNIllustration';

const keyExtractor = (item: string) => `report_${item}`;

function LHNOptionsList({style, contentContainerStyles, data, onSelectRow, optionMode}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const flashListRef = useRef<FlashListRef<string>>(null);
    const route = useRoute();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldShowEmptyLHN = data.length === 0;
    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const emptyLHNIllustration = useEmptyLHNIllustration();

    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();

    const emptyLHNSubtitle = useMemo(
        () => (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter]}>
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText1')}
                />
                <Icon
                    src={expensifyIcons.MagnifyingGlass}
                    width={variables.emptyLHNIconWidth}
                    height={variables.emptyLHNIconHeight}
                    fill={theme.icon}
                    small
                    additionalStyles={styles.mh1}
                />
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText2')}
                />
                <Icon
                    src={Expensicons.Plus}
                    width={variables.emptyLHNIconWidth}
                    height={variables.emptyLHNIconHeight}
                    fill={theme.icon}
                    small
                    additionalStyles={styles.mh1}
                />
                <TextBlock
                    color={theme.textSupporting}
                    textStyles={[styles.textAlignCenter, styles.textNormal]}
                    text={translate('common.emptyLHN.subtitleText3')}
                />
            </View>
        ),
        [
            styles.alignItemsCenter,
            styles.flexRow,
            styles.justifyContentCenter,
            styles.flexWrap,
            styles.textAlignCenter,
            styles.mh1,
            theme.icon,
            theme.textSupporting,
            styles.textNormal,
            translate,
            expensifyIcons.MagnifyingGlass,
        ],
    );

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item}: RenderItemProps): ReactElement => {
            return (
                <OptionRowLHNData
                    reportID={item}
                    onSelectRow={onSelectRow ?? (() => {})}
                />
            );
        },
        [onSelectRow],
    );

    const previousOptionMode = usePrevious(optionMode);

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }

        if (!flashListRef.current) {
            return;
        }

        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        flashListRef.current.scrollToOffset({offset: 0});
    }, [previousOptionMode, optionMode]);

    const onScroll = useCallback<NonNullable<FlashListProps<string>['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
            if (isWebOrDesktop) {
                saveScrollIndex(route, Math.floor(e.nativeEvent.contentOffset.y / estimatedItemSize));
            }
            triggerScrollEvent();
        },
        [estimatedItemSize, isWebOrDesktop, route, saveScrollIndex, saveScrollOffset, triggerScrollEvent],
    );

    const onLayout = useCallback(() => {
        const offset = getScrollOffset(route);

        if (!(offset && flashListRef.current) || isWebOrDesktop) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({offset});
        });
    }, [getScrollOffset, route, isWebOrDesktop]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldShowEmptyLHN) {
            Log.info('Woohoo! All caught up. Was rendered', false, {
                reportsCount: Object.keys(reports ?? {}).length,
                reportActionsCount: Object.keys(reportActions ?? {}).length,
                policyCount: Object.keys(policy ?? {}).length,
                personalDetailsCount: Object.keys(personalDetails ?? {}).length,
                route,
                reportsIDsFromUseReportsCount: data.length,
            });
        }
    }, [data.length, shouldShowEmptyLHN, route, reports, reportActions, policy, personalDetails]);

    return (
        <View style={[style ?? styles.flex1, shouldShowEmptyLHN ? styles.emptyLHNWrapper : undefined]}>
            {shouldShowEmptyLHN ? (
                <BlockingView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(emptyLHNIllustration as BlockingViewProps)}
                    title={translate('common.emptyLHN.title')}
                    CustomSubtitle={emptyLHNSubtitle}
                    accessibilityLabel={translate('common.emptyLHN.title')}
                />
            ) : (
                <FlashList
                    ref={flashListRef}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    CellRendererComponent={OptionRowRendererComponent}
                    contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                    data={data.map((report) => report.reportID)}
                    testID="lhn-options-list"
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    onLayout={onLayout}
                    onScroll={onScroll}
                    initialScrollIndex={isWebOrDesktop ? getScrollIndex(route) : undefined}
                    maintainVisibleContentPosition={{disabled: true}}
                    drawDistance={1000}
                    removeClippedSubviews
                />
            )}
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default memo(LHNOptionsList);
