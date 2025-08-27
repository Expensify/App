# LogSearch Tool - Enhanced Version

This directory contains the enhanced LogSearch tool with improved column management and copy/paste functionality.

## New Features

### 1. Sticky Table Headers
- Column headers now remain visible when scrolling through long result sets
- Headers clearly identify which data is in each column
- Responsive design works on different screen sizes

### 2. Column Reordering
- Users can now drag and drop columns to reorder them in the column selection modal
- Selected columns can be removed by clicking the × button
- Available columns can be added by clicking the + button
- Column order is preserved in localStorage

### 3. Improved Copy/Paste
- New "Copy Table" button creates properly formatted markdown tables
- Includes column headers when copying
- Better formatting for pasting into GitHub issues and documentation
- Fallback copy mechanism for older browsers

### 4. Enhanced Column Management
- Visual drag handles (⋮⋮) for intuitive reordering
- Clear separation between selected and available columns
- Real-time preview of changes
- Persistent settings across browser sessions

## Files

- `main.js` - Enhanced JavaScript with new functionality
- `logSearch.css` - Styling for sticky headers and drag-and-drop interface  
- `index.html` - Complete HTML interface for testing/demonstration
- `README.md` - This documentation file

## Key Improvements Made

### JavaScript Changes (`main.js`)

1. **Added `getColumnDisplayName()` function** - Provides human-readable column names
2. **Enhanced `redrawResultsPanel()` function** - Now creates sticky table headers
3. **Redesigned `populateColumnsModal()` function** - Supports drag-and-drop column reordering
4. **Added `initializeColumnSorting()` function** - Handles drag-and-drop functionality
5. **Added `copyTableWithHeaders()` function** - Creates markdown-formatted tables for copying
6. **Added `fallbackCopyText()` function** - Supports older browsers without clipboard API

### CSS Enhancements (`logSearch.css`)

1. **Sticky header styles** - Keeps column headers visible during scrolling
2. **Drag-and-drop styling** - Visual feedback for column reordering
3. **Modal improvements** - Better layout for column management interface
4. **Responsive design** - Works well on mobile and desktop
5. **Table enhancements** - Better readability and hover effects

### HTML Structure (`index.html`)

1. **Complete interface** - Full working example of the enhanced tool
2. **Bootstrap integration** - Modern, responsive design
3. **jQuery UI support** - Required for drag-and-drop functionality
4. **Modal dialogs** - For column management and settings

## Usage

### Column Management
1. Click "Select/Reorder Columns" to open the column management modal
2. Drag columns using the ⋮⋮ handle to reorder them
3. Click × to remove columns from the display
4. Click + to add available columns to the display
5. Changes are saved automatically

### Copy Table Data
1. Click the "Copy Table" button in any results panel
2. Data is copied as a markdown table with headers
3. Paste directly into GitHub issues or documentation

### Keyboard Shortcuts
- **Shift + ?** - Show keyboard shortcuts dialog
- **Shift + X** - Close last panel
- **Shift + Q** - Toggle quiet mode
- **Shift + S** - Toggle silent mode  
- **Shift + P** - Toggle performance mode
- **Alt + click** - Highlight table row
- **ESC** - Close open dialogs

## Browser Compatibility

- Modern browsers with clipboard API support (Chrome 66+, Firefox 63+, Safari 13.1+)
- Fallback support for older browsers using document.execCommand
- Requires jQuery UI for drag-and-drop functionality
- Bootstrap 4+ recommended for optimal styling

## Dependencies

- jQuery 3.6+
- jQuery UI 1.12+ (for sortable functionality)
- Bootstrap 4.6+ (for modal dialogs and styling)
- Moment.js (for date handling)
- Underscore.js (for utility functions)

## Implementation Notes

The enhanced LogSearch tool maintains backward compatibility with existing functionality while adding these new features. All settings are preserved in localStorage, so users' preferences persist across browser sessions.

The column reordering uses jQuery UI's sortable widget, which provides smooth drag-and-drop interactions. The sticky headers use CSS `position: sticky` for optimal performance.

Copy functionality includes both modern clipboard API support and fallback methods to ensure compatibility across different browsers and security contexts.