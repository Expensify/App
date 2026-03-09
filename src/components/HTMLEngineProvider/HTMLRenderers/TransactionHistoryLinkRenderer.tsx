import React from 'react';
import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useEnterKeyHandler from '@hooks/useEnterKeyHandler';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type TransactionHistoryLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

// This component is rendered whenever a locale string uses the <transaction-history-link> custom tag.
// Used on outcome screens (e.g. AlreadyReviewedFailureScreen). Navigating to search may re-trigger
// useNavigateTo3DSAuthorizationChallenge if a pending challenge exists; that behavior is acceptable
// as the user is leaving the flow and the next challenge (if any) would be shown from the stack.
function TransactionHistoryLinkRenderer({tnode, style}: TransactionHistoryLinkRendererProps) {
    const styles = useThemeStyles();

    const navigateToTransactionHistory = () => {
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    };

    const handleKeyDown = useEnterKeyHandler(navigateToTransactionHistory);

    return (
        <Text
            style={[style as TextStyle, styles.link]}
            onPress={navigateToTransactionHistory}
            onKeyDown={handleKeyDown}
            suppressHighlighting
            accessible
            role={CONST.ROLE.LINK}
            tabIndex={0}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

export default TransactionHistoryLinkRenderer;
