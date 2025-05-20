import React from 'react';
import { View, Image } from 'react-native';
import { PressableWithFeedback } from '@components/Pressable';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {EventItem} from '@src/types/onyx';
import useLocalize from '@hooks/useLocalize';
import * as Expensicons from '@components/Icon/Expensicons';
import Icon from '@components/Icon';
import CONST from '@src/CONST';
import {format} from 'date-fns';

type EventCardProps = {
  item: EventItem,
  onToggleFavorite: (id: string, isFavoritePrev: boolean) => void;
}

export default function EventCard({ item, onToggleFavorite }: EventCardProps) {
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const isMultiDay = item.startDate !== item.endDate;

  const displayDate = isMultiDay 
    ? `${format(item.startDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT)} - ${format(item.endDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT)}` 
    : format(item.startDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT)

  return (
    <View style={[styles.flexRow, styles.p4, styles.bgPaleGreen, styles.mh3, styles.mv1, styles.br2]}>
      <Image source={{ uri: item.thumbnail }} style={[styles.w20, styles.h10, styles.mr2]} />
      <View style={styles.flex1}>
        <Text>{item.name}</Text>
        <Text>
          {displayDate}
        </Text>
      </View>
      <PressableWithFeedback accessibilityLabel={translate('common.save')} onPress={() => onToggleFavorite(item.id, !!item.isFavorite)}>
        <Icon 
          src={Expensicons.Bookmark}
          fill={item?.isFavorite ? styles.textBlue.color : styles.textWhite.color}
          width={24}
          height={24}
        />
      </PressableWithFeedback>
    </View>
  );
}
