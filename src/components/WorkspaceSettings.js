// Ensure that the upgrade page is not shown again after enabling Report fields

import React, { useState, useEffect } from 'react';
import UpgradePage from './UpgradePage';

function WorkspaceSettings() {
  const [showUpgradePage, setShowUpgradePage] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the upgrade page and set state accordingly
    const hasSeenUpgrade = localStorage.getItem('hasSeenUpgrade');
    setShowUpgradePage(!hasSeenUpgrade);
  }, []);

  const handleEnableReportFields = () => {
    // Logic to enable Report fields
    // ...
    // Set the flag in local storage to indicate that the upgrade page has been shown
    localStorage.setItem('hasSeenUpgrade', 'true');
    setShowUpgradePage(false);
  };

  return (
    <div>
      {showUpgradePage && <UpgradePage />}
      <button onClick={handleEnableReportFields}>Enable Report Fields</button>
    </div>
  );
}

export default WorkspaceSettings;