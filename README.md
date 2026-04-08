# PNB Merchant Portal

A modern, React-based portal for PNB merchants to manage their Soundbox devices, track transaction reports, and generate UPI QR codes.

## 🚀 Key Features

- **Dashboard**: Real-time view of device status (Online/Offline) and transaction summary.
- **Transaction Reports**: Detailed transaction logs with support for Excel export and date filtering.
- **QR Details**: Generate and download both Static and Dynamic UPI QR codes.
- **Language Update**: Manage Soundbox audio notifications by updating device language (Hindi, English, etc.) via remote status updates.
- **Profile Management**: View detailed merchant and device information directly from the authenticated session.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS (Modern design patterns, Glassmorphism)
- **Icons**: Lucide React
- **Authentication**: OIDC (OpenID Connect) via `oidc-client-ts`
- **API Layer**: Axios with centralized `apiService`
- **State Management**: React Context API (`AuthContext`, `VpaContext`)

## 📂 Project Structure

```text
src/
├── assets/         # Images and SVGs (PNB Logo)
├── components/     # Reusable components (Layout, Modals)
├── context/        # Global state (Auth, VPA/Merchant data)
├── pages/          # Page components (Dashboard, Reports, Login, etc.)
├── services/       # API and Authentication services
└── styles/         # Global CSS and Design Tokens
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the development server:
   ```bash
   npm run dev
   ```
2. The portal will be available at `http://localhost:3000`.

## 🔒 Security & Environment
- The application uses Vite proxies (`vite.config.ts`) to handle CORS and route requests to PNB Staging/UAT endpoints.
- Authentication is handled via a secure OIDC flow. Tokens are automatically attached to all API requests via Axios interceptors.

## 📄 License
Internal PNB Merchant Tool.
