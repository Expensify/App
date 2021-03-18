import React from 'react';

export default (props) => (
    <input type="checkbox" checked={props.value} onChange={({target}) => props.onValueChange(target.checked)} />
);
