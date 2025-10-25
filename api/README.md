# Ward Management System API

A comprehensive backend API for Municipal Ward People Management Platform that enables ward offices to manage citizen information, track conversations, send notifications, and organize events.

## 🚀 Features

- **Citizen Information Management**: Store and manage resident records with household grouping
- **Communication & Alerts**: Multi-channel notifications (SMS, WhatsApp, Email)
- **Conversation Tracking**: Log interactions with residents and track follow-ups
- **Event Management**: Create and manage ward-level events and activities
- **Analytics & Reporting**: Generate reports and analytics on demographics and issues
- **Role-based Access Control**: Admin, Staff, and Read-only user roles
- **Bulk Operations**: Import/export data via CSV

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS/WhatsApp**: Twilio
- **Scheduling**: Node-cron
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚦 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ward-Management-System/api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb ward_management_dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
api/
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   └── utils/          # Utility functions
├── uploads/            # File uploads directory
├── logs/               # Application logs
├── tests/              # Test files
├── server.js           # Main application file
└── package.json        # Dependencies and scripts
```

## 🔧 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=ward_management_dev
DB_USER=postgres
DB_PASS=password
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
TWILIO_ACCOUNT_SID=your_twilio_sid
```

## 📚 API Documentation

Once the server is running, visit:
- API Overview: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

### Main Endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/residents` - Get all residents
- `POST /api/residents` - Create new resident
- `GET /api/households` - Get household information
- `POST /api/conversations` - Log conversations
- `GET /api/events` - Get events
- `POST /api/notifications` - Send notifications
- `GET /api/reports` - Generate reports

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Production Deployment

1. **Set production environment variables**
2. **Build and run**
   ```bash
   npm start
   ```

## 📋 Development Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the Ward Management Team.