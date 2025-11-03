# Ward Management System - Frontend

Modern React application for Ward Management System built with Vite, Chakra UI, and React Router.

## Features

- 🔐 Authentication (Login/Register)
- 🎨 Beautiful, modern UI with Chakra UI
- ⚡ Fast development with Vite
- 🔒 Protected routes
- 📱 Responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
site/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React context providers
│   ├── utils/          # Utility functions
│   ├── theme.js        # Chakra UI theme
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json
```

## API Integration

The app is configured to proxy API requests to `http://localhost:5000/api` during development.

Make sure the backend API server is running on port 5000.

