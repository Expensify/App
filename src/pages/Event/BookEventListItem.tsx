import { format } from 'date-fns';
import React, {useCallback, useMemo} from 'react';
import { View } from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {handleClickOnEvent} from '@src/libs/actions/Event';

 type BookEventListItemProps = {
    /** ID of the event */
    id: string;

    /** Name of the event */
    name: string;

    /** Start of the event */
    startDate: string;

    /** End of the event */
    endDate: string;

    /** Thumbnail of the event */
    thumbnail: string;

     isFavourite: boolean;
};

const NUMBER_OF_TITLE_LINES = 1;

function BookEventListItem({
                               id,
                               name,
                               startDate,
                               endDate,
                               thumbnail,
                               isFavourite,
                           }: BookEventListItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    const formattedDate = useCallback((date: string) => {
        return format(Number(date), CONST.DATE.FNS_FORMAT_STRING)
    }, []);

    const onPressOnEvent = () => {
        handleClickOnEvent(id)
    }

    const colorOfIcon = useMemo(() => isFavourite ? theme.success : theme.icon, [theme.icon, theme.success, isFavourite]);

    return (
        <PressableWithSecondaryInteraction
            onPress={onPressOnEvent}
            style={[styles.quickReactionsContainer, styles.eventListItemContainer]}
            accessibilityLabel={translate('accessibilityHints.chatMessage')}
            accessible
          >
            <View style={[styles.expenseAndReportPreviewTextContainer]}>
                <Text numberOfLines={NUMBER_OF_TITLE_LINES} style={[styles.taskTitleMenuItem]}>{name}</Text>
                <View style={[styles.eventDate]}>
                    <Text style={[styles.eReceiptWaypointTitle]}>{formattedDate(startDate)}</Text>
                    {endDate ? <Text style={[styles.eReceiptWaypointTitle]}>{formattedDate(endDate)}</Text> : null}
                </View>
            </View>

            <Image style={[styles.eventViewImage]} source={{uri: thumbnail}}/>

            <View style={[styles.eventSvgContainer]}>
                <Icon
                    fill={colorOfIcon}
                    src={Expensicons.Heart}
                />
            </View>

        </PressableWithSecondaryInteraction>
    );
}

BookEventListItem.displayName = 'BookEventListItem';


export default BookEventListItem;
