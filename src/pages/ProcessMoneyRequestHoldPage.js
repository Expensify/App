import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HoldMenuSectionList from '@components/HoldMenuSectionList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

const propTypes = {
    /** Method to trigger when pressing back button of the header */
    onClose: PropTypes.func.isRequired,

    /** Method to trigger when pressing confirm button */
    onConfirm: PropTypes.func.isRequired,
};

function ProcessMoneyRequestHoldPage({onClose, onConfirm}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const footerComponent = useMemo(
        () => (
            <Button
                success
                text={translate('common.buttonConfirm')}
                onPress={onConfirm}
            />
        ),
        [onConfirm, translate],
    );

    return (
        <HeaderPageLayout
            title={translate('common.back')}
            footer={footerComponent}
            onBackButtonPress={onClose}
        >
            <View style={[styles.mh5, styles.flex1]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <Text style={[styles.holdRequestInline]}>{translate('iou.hold')}</Text>
                </View>
                <HoldMenuSectionList />
            </View>
        </HeaderPageLayout>
    );
}

ProcessMoneyRequestHoldPage.propTypes = propTypes;
ProcessMoneyRequestHoldPage.displayName = 'ProcessMoneyRequestHoldPage';

export default ProcessMoneyRequestHoldPage;
