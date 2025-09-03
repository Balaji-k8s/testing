# Ticket Tracking System

A comprehensive web application for tracking and managing tickets with team collaboration features.

## Features

### 🎫 Ticket Management
- **Create Tickets**: Form with title, description, priority level, assignee, category, and file attachments
- **File Upload**: Support for PDF, DOC, DOCX, TXT, JPG, PNG, GIF files with drag-and-drop interface
- **Ticket Updates**: Modify ticket status, priority, assignee, and category
- **Comments System**: Add comments to tickets for team collaboration

### 📊 Dashboard
- **Real-time Statistics**: View counts of open, in-progress, resolved, and closed tickets
- **Advanced Filtering**: Filter tickets by status, priority, assignee, and creation date
- **Smart Sorting**: Sort tickets by creation date, priority, status, or assignee
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📈 KPI Reports
- **Resolution Time Analysis**: Track average ticket resolution times
- **Priority Distribution**: Visual breakdown of tickets by priority level
- **Category Analytics**: Distribution of tickets across different categories
- **Workload Reports**: Assignee workload analysis with detailed breakdowns
- **Export Functionality**: Download reports as CSV files

### 🎨 User Interface
- **Modern Design**: Clean, professional interface with smooth animations
- **Intuitive Navigation**: Easy-to-use navigation between dashboard, ticket creation, and reports
- **Visual Indicators**: Color-coded status and priority indicators
- **Modal Dialogs**: Detailed ticket views with inline editing capabilities

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start creating and managing tickets immediately!

### File Structure
```
Ticket Tracking/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## How to Use

### Creating a Ticket
1. Click "Create Ticket" in the navigation
2. Fill in the required fields:
   - **Title**: Brief description of the issue/request
   - **Description**: Detailed explanation
   - **Priority**: Low, Medium, or High
   - **Assignee**: Person responsible for the ticket
   - **Category**: Bug, Feature Request, Support, Maintenance, or Other
3. Optionally attach files by dragging and dropping or clicking to browse
4. Click "Create Ticket" to save

### Managing Tickets
1. View all tickets on the Dashboard
2. Use filters to find specific tickets:
   - Filter by status (Open, In Progress, Resolved, Closed)
   - Filter by priority (Low, Medium, High)
   - Filter by assignee
   - Sort by various criteria
3. Click on any ticket to view details and make updates
4. Add comments to track progress and communicate with team members

### Generating Reports
1. Navigate to the "Reports" section
2. Click "Generate Report" to view KPI analytics
3. Review key metrics including:
   - Total ticket counts
   - Average resolution times
   - Priority and category distributions
   - Assignee workload analysis
4. Click "Export Report" to download data as CSV

### Updating Tickets
1. Click on any ticket from the dashboard
2. In the modal dialog, you can:
   - Change ticket status
   - Update priority level
   - Reassign to different team member
   - Change category
   - Add comments
3. Click "Update Ticket" to save changes

## Data Storage

The application uses **localStorage** to persist data in your browser. This means:
- ✅ No server required
- ✅ Data persists between browser sessions
- ✅ Fast performance
- ⚠️ Data is stored locally on your device
- ⚠️ Data will be lost if browser data is cleared

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Features in Detail

### File Upload
- Supports multiple file selection
- Drag-and-drop interface
- File size and type validation
- Visual file list with size indicators

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
- Optimized for both desktop and mobile use

### Real-time Updates
- Dashboard statistics update automatically
- Filter and sort operations are instant
- No page refreshes required
- Smooth animations and transitions

## Customization

The application is built with modern web standards and can be easily customized:

- **Colors**: Modify CSS variables in `styles.css`
- **Layout**: Adjust grid systems and responsive breakpoints
- **Functionality**: Extend JavaScript classes in `script.js`
- **Categories**: Add new ticket categories in the form options

## Troubleshooting

### Common Issues

**Tickets not saving**: Ensure your browser supports localStorage and it's not disabled.

**Files not uploading**: Check that file types are supported and file sizes are reasonable.

**Reports not generating**: Make sure you have tickets in the system to generate meaningful reports.

**Mobile display issues**: Try refreshing the page or clearing browser cache.

### Browser Settings
- Enable JavaScript
- Allow localStorage
- Ensure pop-ups are allowed for file downloads

## Future Enhancements

Potential features for future versions:
- User authentication and role-based access
- Email notifications
- Advanced search functionality
- Ticket templates
- Integration with external systems
- Real-time collaboration features
- Advanced reporting with charts and graphs

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you're using a supported browser
3. Try clearing browser cache and localStorage
4. Verify all files are present and properly loaded

## License

This project is open source and available under the MIT License.

---

**Enjoy managing your tickets efficiently with this comprehensive tracking system!** 🎫✨
