import {format} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type WorkspaceCompanyCardsBalanceLabelProps = {
    /** Which balance stat this label shows */
    type: typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE | typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT;

    /** Value in cents, or undefined when the bank did not report it */
    value: number | undefined;

    /** Datetime the balance was last fetched, formatted as 'yyyy-MM-dd HH:mm:ss', shown in the tooltip */
    lastUpdated: string | undefined;

    /** Currency the value is denominated in */
    currency: string;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;
};

function WorkspaceCompanyCardsBalanceLabel({type, value, lastUpdated, currency, style}: WorkspaceCompanyCardsBalanceLabelProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);

    const [isVisible, setVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 3;

        setAnchorPosition({
            top: position.top + position.height + BOTTOM_MARGIN_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);

    const displayValue = value === undefined ? translate('workspace.companyCards.balance.notAvailable') : convertToDisplayString(value, currency);
    const formattedLastUpdated = lastUpdated ? format(new Date(lastUpdated.replace(' ', 'T')), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : undefined;

    return (
        <View style={[styles.flex1, style]}>
            <View
                ref={anchorRef}
                style={[styles.flexRow, styles.alignItemsCenter, styles.mb1]}
            >
                <Text style={[styles.mutedNormalTextLabel, styles.mr1]}>{translate(`workspace.companyCards.balance.${type}`)}</Text>
                <PressableWithFeedback
                    accessibilityLabel={translate(`workspace.companyCards.balance.${type}`)}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    onPress={() => setVisible(true)}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE_CARDS_LIST.INFO_BUTTON}
                >
                    <Icon
                        src={icons.Info}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        fill={theme.icon}
                    />
                </PressableWithFeedback>
            </View>
            <Text style={styles.shortTermsHeadline}>{displayValue}</Text>
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={!shouldUseNarrowLayout ? styles.pr5 : undefined}
                innerContainerStyle={!shouldUseNarrowLayout ? {maxWidth: variables.modalContentMaxWidth} : undefined}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
            >
                <View style={styles.p4}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {translate(`workspace.companyCards.balance.${type}`)}
                    </Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>
                        {formattedLastUpdated
                            ? translate(`workspace.companyCards.balance.${type}Description`, {lastUpdated: formattedLastUpdated})
                            : translate(`workspace.companyCards.balance.${type}DescriptionNoTimestamp`)}
                    </Text>
                </View>
            </Popover>
        </View>
    );
}

export default WorkspaceCompanyCardsBalanceLabel;
