// Static twin of SearchFiltersBarNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import staticPolicyInfoSelector from './staticPolicyInfoSelector';

function StaticDropdownChip({label}: {label: string}) {
    const styles = useThemeStyles();

    return (
        <Button
            small
            isDisabled
            shouldStayNormalOnDisable
        >
            <CaretWrapper
                style={[styles.flex1, styles.mw100]}
                caretWidth={variables.iconSizeExtraSmall}
                caretHeight={variables.iconSizeExtraSmall}
                isActive={false}
            >
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroBold, styles.flexShrink1]}
                >
                    {label}
                </Text>
            </CaretWrapper>
        </Button>
    );
}

/**
 * In the submit-and-navigate flow we only ever land on `type:expense` or `type:invoice`
 * with default status and no extra filters, so the chips are mostly hardcoded.
 * The only conditional chip is "Workspaces" (shown when the user has >1 workspace),
 * resolved via a cheap boolean Onyx selector.
 */
function StaticFiltersBar({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter'] as const);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const hasMultipleWorkspaces = policyInfo?.hasMultipleWorkspaces ?? false;

    const typeLabel = queryJSON.type === CONST.SEARCH.DATA_TYPES.INVOICE ? translate('common.invoice') : translate('common.expense');

    const chips = useMemo(
        () => [
            {key: 'type', label: `${translate('common.type')}: ${typeLabel}`},
            {key: 'status', label: translate('common.status')},
            {key: 'date', label: translate('common.date')},
            {key: 'from', label: translate('common.from')},
            ...(hasMultipleWorkspaces ? [{key: 'workspace', label: translate('workspace.common.workspace')}] : []),
        ],
        [translate, typeLabel, hasMultipleWorkspaces],
    );

    return (
        <View style={[styles.mb2, styles.searchFiltersBarContainer]}>
            <FlatList
                horizontal
                style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                showsHorizontalScrollIndicator={false}
                data={chips}
                keyExtractor={(item) => item.key}
                renderItem={({item}) => <StaticDropdownChip label={item.label} />}
                ListFooterComponent={
                    <Button
                        link
                        small
                        shouldUseDefaultHover={false}
                        text={translate('search.filtersHeader')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={expensifyIcons.Filter}
                        textStyles={[styles.textMicroBold]}
                        isDisabled
                        shouldStayNormalOnDisable
                    />
                }
            />
        </View>
    );
}

export default StaticFiltersBar;
