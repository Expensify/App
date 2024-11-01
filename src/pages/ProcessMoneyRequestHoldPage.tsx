import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HoldMenuSectionList from '@components/HoldMenuSectionList';
import Text from '@components/Text';
import TextPill from '@components/TextPill';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';

function ProcessMoneyRequestHoldPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

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
                pressOnEnter
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
