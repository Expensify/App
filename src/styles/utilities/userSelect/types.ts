import {CSSProperties} from 'react';

type UserSelectStyles = Record<'userSelectText' | 'userSelectNone', Partial<Pick<CSSProperties, 'userSelect' | 'WebkitUserSelect'>>>;

export default UserSelectStyles;
