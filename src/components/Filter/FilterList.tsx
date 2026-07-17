
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Tag } from 'src/components/Tag';
import { useFilterContext } from 'src/context/FilterContext';

interface FilterListProps {
  // ... other props if necessary
}

const FilterList: React.FC<FilterListProps> = ({ /* props */ }) => {
  const { filterData } = useFilterContext();

  const renderFilterItem = ({ item }) => {
    if (item.type === 'tag') {
      return <Tag tag={item} />;
    }
    // Handle other types of filter items
    return <Text>{item.label}</Text>;
  };

  return (
    <FlatList
      data={filterData}
      renderItem={renderFilterItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default FilterList;