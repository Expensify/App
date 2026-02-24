/* eslint-disable react/no-array-index-key */
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExportIntegrationActionFragments} from '@libs/ReportActionsUtils';
import type {ReportAction} from '@src/types/onyx';

type ExportIntegrationProps = {
    action: OnyxEntry<ReportAction>;
};

function ExportIntegration({action}: ExportIntegrationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
