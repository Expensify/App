import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HoldMenuSectionList from '@components/HoldMenuSectionList';
import Text from '@components/Text';
import TextPill from '@components/TextPill';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';

function ProcessMoneyRequestHoldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const onConfirm = useCallback(() => {
        IOU.dismissHoldUseExplanation();
        Navigation.goBack();
    }, []);

    const footerComponent = useMemo(
        () => (
            <Button
                success
                text={translate('common.buttonConfirm')}
                onPress={onConfirm}
                large
            />
        ),
        [onConfirm, translate],
    );

    return (
        <HeaderPageLayout
            title={translate('iou.hold')}
            footer={footerComponent}
            onBackButtonPress={() => Navigation.goBack()}
            testID={ProcessMoneyRequestHoldPage.displayName}
        >
            <View style={[styles.mh5, styles.flex1]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <TextPill textStyles={styles.holdRequestInline}>{translate('violations.hold')}</TextPill>
                </View>
                <HoldMenuSectionList />
            </View>
        </HeaderPageLayout>
    );
}

ProcessMoneyRequestHoldPage.displayName = 'ProcessMoneyRequestHoldPage';

export default ProcessMoneyRequestHoldPage;
