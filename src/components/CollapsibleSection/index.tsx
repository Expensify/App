import React, {useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import Collapsible from './Collapsible';

type CollapsibleSectionProps = ChildrenProps & {
    /** Title of the Collapsible section */
    title: string;
};

function CollapsibleSection({title, children}: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Expands/collapses the section
     */
    const toggleSection = () => {
        setIsExpanded(!isExpanded);
    };

    const src = isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow;

    return (
        <View style={styles.mt4}>
            <PressableWithFeedback
                onPress={toggleSection}
                style={[styles.pb4, styles.flexRow]}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel={title}
                hoverDimmingValue={1}
                pressDimmingValue={0.2}
            >
                <Text
                    style={[styles.flex1, styles.textStrong, styles.userSelectNone]}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    {title}
                </Text>
                <Icon src={src} />
            </PressableWithFeedback>
            <View style={styles.collapsibleSectionBorder} />
            <Collapsible isOpened={isExpanded}>
                <View>{children}</View>
            </Collapsible>
        </View>
    );
}

export default CollapsibleSection;
