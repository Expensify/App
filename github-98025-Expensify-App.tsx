// Assuming this is in a React component file like WorkspaceChatView.tsx or similar
// The key fix is to conditionally render the button based on isExporting state

import React, { useState, useEffect } from 'react';

// ... other imports ...

const WorkspaceChatView = () => {
  const [isExporting, setIsExporting] = useState(false);
  
  // ... other state and logic ...

  const handleExportToNetSuite = async () => {
    setIsExporting(true);
    try {
      // ... export logic ...
      await exportToNetSuite();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* ... other UI ... */}
      
      {!isExporting && (
        <Button
          variant="primary"
          onClick={handleExportToNetSuite}
          disabled={isExporting}
        >
          Export to NetSuite
        </Button>
      )}
      
      {isExporting && (
        <Spinner />
      )}
      
      {/* ... other UI ... */}
    </div>
  );
};

export default WorkspaceChatView;