import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {BlockingViewProps} from '@components/BlockingViews/BlockingView';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import TextBlock from '@components/TextBlock';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import useEmptyLHNIllustration from './useEmptyLHNIllustration';

function LHNEmptyState() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass', 'Plus']);
    const emptyLHNIllustration = useEmptyLHNIllustration();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policy] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    useEffect(() => {
        Log.info('Woohoo! All caught up. Was rendered', false, {
            reportsCount: Object.keys(reports ?? {}).length,
            policyCount: Object.keys(policy ?? {}).length,
            personalDetailsCount: Object.keys(personalDetails ?? {}).length,
        });
    }, [reports, policy, personalDetails]);

    const subtitle = (
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
                src={expensifyIcons.Plus}
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
    );

    return (
        <BlockingView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(emptyLHNIllustration as BlockingViewProps)}
            title={translate('common.emptyLHN.title')}
            CustomSubtitle={subtitle}
            accessibilityLabel={translate('common.emptyLHN.title')}
        />
    );
}

export default LHNEmptyState;
