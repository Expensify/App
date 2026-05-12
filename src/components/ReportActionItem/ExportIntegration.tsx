/* eslint-disable react/no-array-index-key */
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExportIntegrationActionFragments, getExportIntegrationMessageHTML, hasReasoning} from '@libs/ReportActionsUtils';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ExportIntegrationProps = {
    action: OnyxEntry<ReportAction>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function ExportIntegration({action, originalReport}: ExportIntegrationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action?.childReportID)}`);

    if (hasReasoning(action)) {
        const message = getExportIntegrationMessageHTML(translate, action);
        return (
            <ReportActionItemMessageWithExplain
                message={message}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    const fragments = getExportIntegrationActionFragments(translate, action);

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.flexWrap]}>
            {fragments.map((fragment, index) => {
                if (!fragment.url) {
                    return (
                        <Text
                            key={index}
                            style={[styles.chatItemMessage, styles.colorMuted]}
                        >
                            {fragment.text}{' '}
                        </Text>
                    );
                }

                return (
                    <TextLink
                        key={index}
                        href={fragment.url}
                    >
                        {fragment.text}{' '}
                    </TextLink>
                );
            })}
        </View>
    );
}

export default ExportIntegration;
