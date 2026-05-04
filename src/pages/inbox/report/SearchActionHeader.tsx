import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getChatListItemReportName} from '@libs/ReportUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type SearchActionHeaderProps = {
    /** The report action being rendered. */
    action: ReportAction;
    /** The report this action belongs to. */
    report: OnyxEntry<Report>;
    /** Whether the underlying action is a whisper. Used to skip bottom margin when WhisperBanner is rendered below. */
    isWhisper: boolean;
    /** Tap handler for the report-name link. */
    onPress?: () => void;
    /** The action content to render below the header. */
    children: React.ReactNode;
};

function SearchActionHeaderContent({action, report, isWhisper, onPress, children}: SearchActionHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const reportName = getChatListItemReportName(action, report, conciergeReportID);

    return (
        <View style={[styles.p4]}>
            <View style={styles.webViewStyles.tagStyles.ol}>
                <View style={[styles.flexRow, styles.alignItemsCenter, !isWhisper ? styles.mb3 : {}]}>
                    <Text style={styles.chatItemMessageHeaderPolicy}>{translate('common.in')}&nbsp;</Text>
                    <TextLink
                        fontSize={variables.fontSizeSmall}
                        onPress={() => {
                            onPress?.();
                        }}
                        numberOfLines={1}
                    >
                        {reportName}
                    </TextLink>
                </View>
                {children}
            </View>
        </View>
    );
}

function SearchActionHeader({action, report, isWhisper, onPress, children}: SearchActionHeaderProps) {
    const isOnSearch = useIsOnSearch();

    if (!isOnSearch) {
        return children;
    }

    return (
        <SearchActionHeaderContent
            action={action}
            report={report}
            isWhisper={isWhisper}
            onPress={onPress}
        >
            {children}
        </SearchActionHeaderContent>
    );
}

export default SearchActionHeader;
