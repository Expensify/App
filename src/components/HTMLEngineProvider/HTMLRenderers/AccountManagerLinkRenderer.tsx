import React, {useCallback} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type AccountManagerLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

function AccountManagerLinkRenderer({tnode, style}: AccountManagerLinkRendererProps) {
    const styles = useThemeStyles();
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {canBeMissing: true});

    // Define link style based on context
    let linkStyle: StyleProp<TextStyle> = styles.link;

    if (HTMLEngineUtils.isChildOfRBR(tnode)) {
        linkStyle = [
            styles.link,
            {
                fontSize: HTMLEngineUtils.getFontSizeOfRBRChild(tnode),
            },
        ];
    }

    const navigateToAccountManager = useCallback(() => {
        if (!accountManagerReportID) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID));
    }, [accountManagerReportID]);

    return (
        <Text
            style={[style as TextStyle, linkStyle]}
            onPress={navigateToAccountManager}
            suppressHighlighting
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

AccountManagerLinkRenderer.displayName = 'AccountManagerLinkRenderer';

export default AccountManagerLinkRenderer;
