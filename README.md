# Prompt Manager

A modern web application for managing, organizing, and utilizing AI prompts efficiently. Built with React, TypeScript, and SQLite, featuring a clean and intuitive interface.

## Features

- 📝 Create and manage AI prompts with titles, content, and tags
- 🔍 Search functionality to quickly find specific prompts
- 🏷️ Tag-based organization system
- 📊 Analytics dashboard for prompt usage insights
- 📱 Responsive design for desktop and mobile use
- 🌙 Clean, modern interface with a dark sidebar
- 💾 Local SQLite storage for data persistence

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/promptManager-boltSQLite.git
cd promptManager-boltSQLite
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
# or
yarn build
```

## Project Structure

```
promptManager-boltSQLite/
├── src/
│   ├── components/        # React components
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── index.html           # HTML entry point
```

## Key Components

- **Dashboard**: Main interface for viewing and managing prompts
- **NewPromptModal**: Modal for creating new prompts
- **Sidebar**: Navigation and application sections
- **AnalyticsView**: Displays prompt usage statistics
- **PromptsView**: Alternative view for prompt management
- **HistoryView**: View prompt usage history

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- SQLite (for local data storage)
- Lucide React (for icons)

## Features in Detail

### Prompt Management
- Create new prompts with titles and content
- Add tags for organization
- Search through existing prompts
- Copy prompts to clipboard
- View prompt details

### Analytics
- Track prompt usage
- View tag statistics
- Monitor prompt creation dates
- Analyze prompt modifications

### User Interface
- Responsive design
- Dark sidebar with light content area
- Modern and clean aesthetic
- Intuitive navigation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
