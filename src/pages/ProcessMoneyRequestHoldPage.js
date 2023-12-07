import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

function ProcessMoneyRequestHoldPage({onClose, onConfirm}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const interstitialSections = useMemo(() => {
        const baseInterstitialSections = [
            {
                icon: Illustrations.Hourglass,
                titleTranslationKey: 'iou.whatIsHoldTitle',
                descriptionTranslationKey: 'iou.whatIsHoldExplain',
            },
            {
                icon: Illustrations.CommentBubbles,
                titleTranslationKey: 'iou.holdIsTemporaryTitle',
                descriptionTranslationKey: 'iou.holdIsTemporaryExplain',
            },
            {
                icon: Illustrations.TrashCan,
                titleTranslationKey: 'iou.deleteHoldTitle',
                descriptionTranslationKey: 'iou.deleteHoldExplain',
            },
        ];

        return _.map(baseInterstitialSections, (section) => (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                <Icon
                    width={variables.holdMenuIconSize}
                    height={variables.holdMenuIconSize}
                    src={section.icon}
                    additionalStyles={[styles.mr3]}
                />
                <View style={[styles.flex1, styles.justifyContentCenter]}>
                    <Text style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey)}</Text>
                    <Text
                        style={[styles.textNormal]}
                        numberOfLines={3}
                    >
                        {translate(section.descriptionTranslationKey)}
                    </Text>
                </View>
            </View>
        ));
    }, [styles, translate]);

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
                {interstitialSections}
            </View>
        </HeaderPageLayout>
    );
}

ProcessMoneyRequestHoldPage.propTypes = propTypes;
ProcessMoneyRequestHoldPage.displayName = 'StatusPage';

export default ProcessMoneyRequestHoldPage;
