// Ensure that the selection mode is reset when a new group filter is applied
import React, { useState } from 'react';

const GroupFilter = ({ groups }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleGroupChange = (group) => {
    setSelectedGroup(group);
    setSelectionMode(true);
  };

  return (
    <div>
      {groups.map((group) => (
        <button key={group.id} onClick={() => handleGroupChange(group)} disabled={selectionMode && selectedGroup !== group.id}>{group.name}</button>
      ))}
    </div>
  );
};

export default GroupFilter;