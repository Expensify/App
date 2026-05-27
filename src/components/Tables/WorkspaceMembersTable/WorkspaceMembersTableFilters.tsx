import {View} from 'react-native';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type WorkspaceMembersTableFiltersProps = {
    memberCount: number;
};

export default function WorkspaceMembersTableFilters({memberCount}: WorkspaceMembersTableFiltersProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <View style={[styles.flexRow, styles.gap2]}>{memberCount > CONST.STANDARD_LIST_ITEM_LIMIT && <Table.SearchBar label={translate('workspace.people.findMember')} />}</View>;
}
