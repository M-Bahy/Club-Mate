# Sport Club Management System

A comprehensive backend system for managing sport club operations including members, sports, and subscriptions. Built with NestJS, TypeScript, and Supabase.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Members API](#members-api)
  - [Sports API](#sports-api)
  - [Subscriptions API](#subscriptions-api)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Features

- 🏃‍♂️ **Member Management**: Create, read, update, and delete club members
- ⚽ **Sport Management**: Manage different sports with pricing and gender restrictions
- 📝 **Subscription Management**: Handle member subscriptions to sports with different types (group/private)
- 🛡️ **Data Validation**: Comprehensive input validation using class-validator
- ⚡ **Caching**: Application-level caching using NestJS built-in cache manager
- 🔄 **Real-time Database**: Supabase integration for real-time data management
- 🧪 **Testing**: Comprehensive unit testing setup

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)
- **Testing**: [Jest](https://jestjs.io/)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/M-Bahy/sport-club-managment.git
   cd sport-club-managment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment Setup

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   
   Update the `.env` file with your Supabase credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

3. **Database Setup**
   
   Ensure your Supabase database is set up with the required tables for members, sports, and subscriptions. The application uses TypeORM entities to define the database schema.

## Running the Application

### Development Mode
```bash
# Start the application in development mode with hot reload
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start the application in production mode
npm run start:prod
```

### Debug Mode
```bash
# Start the application in debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000` (or the port specified in your environment variables).

## API Documentation

### Base URL
```
http://localhost:3000
```

### Members API

#### Create Member
- **POST** `/members`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "dob": "1990-01-15",
    "associatedMemberId": "uuid-optional"
  }
  ```
- **Response**: Created member object

#### Get All Members
- **GET** `/members`
- **Response**: Array of all members

#### Get Member by ID
- **GET** `/members/:id`
- **Response**: Member object

#### Update Member
- **PATCH** `/members/:id`
- **Body**: Partial member object
- **Response**: Updated member object

#### Delete Member
- **DELETE** `/members/:id`
- **Response**: Deleted member object

### Sports API

#### Create Sport
- **POST** `/sports`
- **Body**:
  ```json
  {
    "name": "Football",
    "price": 100.50,
    "allowedGender": "male"
  }
  ```
- **Response**: Created sport object

#### Get All Sports
- **GET** `/sports`
- **Cache**: 5 minutes TTL
- **Response**: Array of all sports

#### Get Sport by ID
- **GET** `/sports/:id`
- **Response**: Sport object

#### Update Sport
- **PATCH** `/sports/:id`
- **Body**: Partial sport object
- **Response**: Updated sport object

#### Delete Sport
- **DELETE** `/sports/:id`
- **Response**: Deleted sport object

### Subscriptions API

#### Create Subscription
- **POST** `/subscriptions`
- **Body**:
  ```json
  {
    "memberId": "member-uuid",
    "sportId": "sport-uuid",
    "subscriptionDate": "2024-01-15",
    "subscriptionType": "group"
  }
  ```
- **Response**: Created subscription object

#### Get All Subscriptions
- **GET** `/subscriptions`
- **Response**: Array of all subscriptions

#### Get Subscriptions by Member ID
- **GET** `/subscriptions/member/:memberId`
- **Response**: Array of subscriptions for the specified member

#### Get Subscriptions by Sport ID
- **GET** `/subscriptions/sport/:sportId`
- **Response**: Array of subscriptions for the specified sport

#### Update Subscription
- **PATCH** `/subscriptions`
- **Body**: Update subscription DTO
- **Response**: Updated subscription object

#### Delete Subscription (Unsubscribe)
- **DELETE** `/subscriptions`
- **Body**: Unsubscribe DTO
- **Response**: Success message

### Data Models

#### Gender Enum For Members
```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}
```

#### Gender Enum For Sports
```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  MIX = 'mix',
}
```

#### Subscription Type Enum
```typescript
enum SubscriptionType {
  GROUP = 'group',
  PRIVATE = 'private'
}
```

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Test Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## Project Structure

```
src/
├── app.controller.ts          # Main application controller
├── app.module.ts             # Root module
├── app.service.ts            # Main application service
├── main.ts                   # Application entry point
├── member/                   # Member module
│   ├── dto/                  # Data Transfer Objects
│   ├── entities/             # TypeORM entities
│   ├── enums/               # Enumerations
│   ├── member.controller.ts  # Member endpoints
│   ├── member.module.ts      # Member module definition
│   └── member.service.ts     # Member business logic
├── sport/                    # Sport module
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── sport.controller.ts
│   ├── sport.module.ts
│   └── sport.service.ts
├── subscription/             # Subscription module
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── subscription.controller.ts
│   ├── subscription.module.ts
│   └── subscription.service.ts
└── supabase/                # Supabase integration
    ├── supabase.module.ts
    └── supabase.service.ts
```

## Development Scripts

- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Lint code with ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:debug` - Run tests in debug mode
- `npm run test:e2e` - Run end-to-end tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License.

---

**Repository**: [https://github.com/M-Bahy/sport-club-managment.git](https://github.com/M-Bahy/sport-club-managment.git)
