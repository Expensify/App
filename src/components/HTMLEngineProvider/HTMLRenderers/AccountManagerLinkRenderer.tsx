import React, {useCallback} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useEnterKeyHandler from '@hooks/useEnterKeyHandler';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
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

    const handleKeyDown = useEnterKeyHandler(navigateToAccountManager);

    return (
        <Text
            style={[style as TextStyle, linkStyle]}
            onPress={navigateToAccountManager}
            onKeyDown={handleKeyDown}
            suppressHighlighting
            role={CONST.ROLE.LINK}
            tabIndex={0}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

export default AccountManagerLinkRenderer;
