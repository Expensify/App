import type {TextStyle} from 'react-native';

type UserSelectStyle = Pick<TextStyle, 'userSelect'> & Partial<Pick<TextStyle, 'WebkitUserSelect'>>;
type UserSelectStyles = Record<'userSelectAuto' | 'userSelectText' | 'userSelectNone', UserSelectStyle>;

export default UserSelectStyles;
