# Hybrid Architecture (SSO + Microservices) - Enterprise Platform

## 🏗️ **Architecture Overview**

This is a **true Hybrid Architecture** combining **Single Sign-On (SSO)** with **Microservices** for maximum flexibility and security.

## 📊 **Architecture Diagram**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Frontend      │    │   API Gateway   │
│   Client        │    │   Admin         │    │   (Port 3000)   │
│   (Port 3008)   │    │   (Port 3009)   │    │   Routes & LB   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  SSO Service    │        │  User Service   │
        │  (Port 3001)    │        │  (Port 3002)    │
        │  - Authentication│       │  - User profiles│
        │  - OAuth 2.0    │        │  - Preferences  │
        │  - JWT tokens   │        │  - Settings     │
        │  - MFA          │        │  - Preferences  │
        └─────────┬───────┘        └─────────┬───────┘
                  │                          │
                  ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  Agency Service │        │  Order Service  │
        │  (Port 3003)    │        │  (Port 3004)    │
        │  - Agency mgmt  │        │  - Orders       │
        │  - Business logic│       │  - Payments     │
        │  - Ranking      │        │  - Transactions │
        └─────────┬───────┘        └─────────┬───────┘
                  │                          │
                  ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  Chat Service   │        │  Notification   │
        │  (Port 3005)    │        │  Service        │
        │  - Real-time    │        │  (Port 3006)    │
        │  - Messaging    │        │  - Email/SMS    │
        │  - WebSocket    │        │  - Push         │
        └─────────┬───────┘        └─────────┬───────┘
                  │                          │
                  ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  File Service   │        │  Databases      │
        │  (Port 3007)    │        │  - MySQL (SSO)  │
        │  - File uploads │        │  - PostgreSQL   │
        │  - Documents    │        │  - MongoDB      │
        │  - Media        │        │  - Redis        │
        └─────────────────┘        └─────────────────┘
```

## 🔐 **SSO Service (Port 3001)**
**Centralized Authentication & Authorization**

### Features:
- **OAuth 2.0 / OpenID Connect** - Industry standard
- **JWT Token Management** - Access & refresh tokens
- **Multi-Factor Authentication** - TOTP support
- **Social Login** - Google, GitHub, Facebook, LinkedIn
- **User Management** - Registration, profiles, statuses
- **Agency Management** - Business accounts, ranking
- **Session Management** - Redis-based sessions
- **Activity Logging** - Complete audit trail

### Database:
- **MySQL** - User accounts, OAuth clients, tokens, sessions

## 👤 **User Service (Port 3002)**
**User Profile & Preferences Management**

### Features:
- **User Profiles** - Detailed user information
- **Preferences** - Settings, notifications, privacy
- **Account Management** - Profile updates, verification
- **User Status** - Active, Suspended, Blocked, etc.

### Database:
- **PostgreSQL** - User profiles, preferences, settings

## 🏢 **Agency Service (Port 3003)**
**Agency Management & Business Logic**

### Features:
- **Agency Profiles** - Business information, documents
- **Business Types** - Technical, Construction, Real Estate, etc.
- **Ranking System** - Performance-based ranking
- **Service Areas** - Geographic coverage
- **Financial Management** - Fees, deposits, penalties

### Database:
- **PostgreSQL** - Agency profiles, business data, rankings

## 📦 **Order Service (Port 3004)**
**Order Management & Payments**

### Features:
- **Order Management** - Create, update, track orders
- **Payment Processing** - Stripe, PayPal integration
- **Order Status** - Pending, Working, Complete, etc.
- **Transaction History** - Complete payment records

### Database:
- **PostgreSQL** - Orders, payments, transactions

## 💬 **Chat Service (Port 3005)**
**Real-time Messaging & Communication**

### Features:
- **Live Chat** - Real-time messaging
- **Order Chat** - Order-specific conversations
- **Agency Chat** - Agency communication
- **File Sharing** - Document and media sharing
- **Voice Messages** - Audio message support

### Database:
- **MongoDB** - Messages, conversations, media

## 📧 **Notification Service (Port 3006)**
**Email, SMS & Push Notifications**

### Features:
- **Email Notifications** - Transactional emails
- **SMS Notifications** - OTP, alerts
- **Push Notifications** - Real-time alerts
- **Notification Templates** - Customizable templates

### Database:
- **PostgreSQL** - Notification queue, templates

## 📁 **File Service (Port 3007)**
**File Upload & Document Management**

### Features:
- **File Uploads** - Documents, images, videos
- **File Storage** - Secure file storage
- **Document Management** - Organization, versioning
- **Media Processing** - Image resizing, optimization

### Database:
- **PostgreSQL** - File metadata, permissions

## 🚪 **API Gateway (Port 3000)**
**Single Entry Point & Request Routing**

### Features:
- **Request Routing** - Routes to appropriate microservices
- **Load Balancing** - Distributes load across services
- **Authentication** - Validates JWT tokens with SSO
- **Rate Limiting** - Prevents abuse
- **Request/Response Transformation** - Data formatting
- **CORS Handling** - Cross-origin requests

## 🗄️ **Database Architecture**

### **MySQL (SSO Service)**
- User accounts and authentication
- OAuth clients and tokens
- Sessions and activity logs

### **PostgreSQL (Business Services)**
- User profiles and preferences
- Agency information and rankings
- Orders and transactions
- Notifications and files

### **MongoDB (Real-time Services)**
- Chat messages and conversations
- Real-time data and logs

### **Redis (Caching & Sessions)**
- Session storage
- Cache for frequently accessed data
- Rate limiting counters

## 🔄 **Service Communication**

### **Synchronous Communication (HTTP)**
- Frontend → API Gateway → Microservices
- Service-to-service calls via HTTP
- All services authenticate via SSO

### **Asynchronous Communication (Future)**
- Message queues for event-driven communication
- Event sourcing for data consistency
- Saga pattern for distributed transactions

## 🚀 **Deployment**

### **Development**
```bash
# Start all services
docker-compose -f docker-compose.hybrid.yml up -d

# View logs
docker-compose -f docker-compose.hybrid.yml logs -f

# Stop all services
docker-compose -f docker-compose.hybrid.yml down
```

### **Production**
- Each service can be deployed independently
- Kubernetes manifests for orchestration
- CI/CD pipelines per service
- Blue-green deployments

## 🎯 **Key Benefits**

1. **✅ Centralized Authentication** - Single sign-on across all services
2. **✅ Microservice Flexibility** - Scale services independently
3. **✅ Security Best Practices** - OAuth 2.0/OIDC standards
4. **✅ Reduced Auth Complexity** - Services don't manage auth
5. **✅ Better User Experience** - One login for all services
6. **✅ Independent Deployment** - Deploy services separately
7. **✅ Technology Diversity** - Each service can use different tech
8. **✅ Fault Isolation** - Failure in one service doesn't affect others

## 📊 **Service URLs**

- **API Gateway**: http://localhost:3000/api/v1
- **SSO Service**: http://localhost:3001/api/v1
- **User Service**: http://localhost:3002/api/v1
- **Agency Service**: http://localhost:3003/api/v1
- **Order Service**: http://localhost:3004/api/v1
- **Chat Service**: http://localhost:3005/api/v1
- **Notification Service**: http://localhost:3006/api/v1
- **File Service**: http://localhost:3007/api/v1
- **Frontend Client**: http://localhost:3008
- **Frontend Admin**: http://localhost:3009

This is a **true Hybrid Architecture** that combines the best of both SSO and Microservices approaches!

