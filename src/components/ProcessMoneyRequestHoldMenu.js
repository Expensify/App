import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Button from './Button';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Popover from './Popover';
import refPropTypes from './refPropTypes';
import Text from './Text';

const propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number,
        vertical: PropTypes.number,
    }),
    anchorRef: refPropTypes,
};

const defaultProps = {
    anchorPosition: {},
    anchorRef: () => {},
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm, anchorPosition, anchorRef}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const holdMenuSections = useMemo(() => {
        const baseHoldMenuSections = [
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

        return _.map(baseHoldMenuSections, (section, index) => (
            <View
                key={index}
                style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}
            >
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

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
        >
            <View style={[styles.mh5, styles.mv5]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <Text style={[styles.holdRequestInline]}>{translate('iou.hold')}</Text>
                </View>
                {holdMenuSections}
                <Button
                    success
                    style={[styles.mt5]}
                    text={translate('common.buttonConfirm')}
                    onPress={onConfirm}
                />
            </View>
        </Popover>
    );
}

ProcessMoneyRequestHoldMenu.propTypes = propTypes;
ProcessMoneyRequestHoldMenu.defaultProps = defaultProps;
ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
