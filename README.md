# Atria Frontend

React + TypeScript frontend for the Atria event management platform with authentication, event browsing, and submission management.

## Features

- User authentication with JWT
- Event discovery and browsing
- Event creation and management
- Submission tracking and management
- Role-based UI components
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your backend API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Running the Application

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── auth/             # Authentication components and context
├── components/       # Reusable components
├── events/           # Event-related components
├── layout/           # Layout components
├── submissions/      # Submission-related components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main app component
├── routes.tsx        # Route definitions
└── main.tsx          # Entry point
```

## Technologies Used

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

## Environment Variables

Create a `.env.local` file with:

```
VITE_API_URL=http://localhost:5000/api
```

## License

ISC
