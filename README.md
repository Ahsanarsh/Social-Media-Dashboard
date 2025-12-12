# 📱 Social Media Dashboard

A full-stack social media application built with modern web technologies. Features include user authentication, real-time notifications, posts with images, comments, likes, reposts, bookmarks, and much more.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### **User Features**

- 🔐 **Authentication & Authorization**

  - Email/Password registration with OTP verification
  - JWT-based authentication (Access & Refresh tokens)
  - Secure HTTP-only cookies
  - Email verification required before login

- 👤 **User Profiles**

  - Customizable profile (bio, location, website)
  - Avatar and cover photo uploads
  - Follow/Unfollow system
  - View followers and following lists
  - User statistics (posts count, followers count)

- 📝 **Posts**

  - Create posts with text and/or images
  - Image upload to Cloudinary
  - Hashtag parsing (#hashtag)

- 💬 **Interactions**

  - Like/Unlike posts
  - Comment on posts
  - Repost (share) posts
  - Bookmark posts for later

- 🔍 **Discovery**

  - Search users, posts, and hashtags
  - Explore page with trending content
  - Trending hashtags
  - User suggestions (who to follow)
  - Hashtag pages

- 🔔 **Notifications**

  - Real-time notifications (Socket.io)
  - Notification types: likes, comments, follows, reposts
  - Unread notification count
  - Mark as read functionality

- 🎨 **UI/UX**
  - Dark mode support
  - Fully responsive (mobile, tablet, desktop)
  - Smooth animations and transitions
  - Loading states and error handling
  - Toast notifications

### **Advanced Features**

- Real-time updates with Socket.io
- Pagination for feeds
- Optimistic UI updates
- Multi-language support (English/Urdu)
- Image optimization with Cloudinary

---

## 🛠️ Tech Stack

### **Backend**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer (Gmail)
- **Real-time**: Socket.io
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Utilities**: uuid, validator, dotenv

### **Frontend**

- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Date Formatting**: date-fns
- **Real-time Client**: Socket.io Client
- **Internationalization**: react-i18next

### **DevOps & Tools**

- **Version Control**: Git
- **Database Hosting**: Neon (Serverless PostgreSQL)
- **Image Storage**: Cloudinary
- **Development**: Nodemon, ESLint

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

You'll also need accounts for:

- **Neon** (Database) - [Sign up](https://neon.tech/)
- **Cloudinary** (Image hosting) - [Sign up](https://cloudinary.com/)
- **Gmail** (For sending emails) - [Enable App Passwords](https://support.google.com/accounts/answer/185833)

---

## 🚀 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/social-media-dashboard.git
cd social-media-dashboard
```

---

### **2. Backend Setup**

#### **Install Dependencies**

```bash
cd backend
npm install
```

#### **Configure Environment Variables**

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@host.region.neon.tech/database?sslmode=require

# OR for local PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=social_media_db
DB_PORT=5432

# JWT Secrets (generate random strings)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### **Create Database Tables**

```bash
node utils/setup.js
```

Expected output:

```
✅ Created table: users
✅ Created table: posts
✅ Created table: comments
...
🎉 Database setup complete!
```

#### **Add Database Indexes (Optional but Recommended)**

```bash
node utils/addIndexes.js
```

This adds 23 indexes for 60% faster queries.

#### **Start Backend Server**

```bash
npm run dev
```

You should see:

```
Server running on port 3000
Database connected
Initializing Socket.io...
```

---

### **3. Frontend Setup**

Open a **new terminal** window.

#### **Install Dependencies**

```bash
cd frontend
npm install
```

#### **Configure Environment Variables**

Create a `.env` file in the `frontend` folder:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Social Media Dashboard
```

#### **Start Frontend Development Server**

```bash
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### **4. Access the Application**

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the login/signup page!

---

## 🎯 Usage

### **First-Time Setup**

1. **Register a new account**

   - Click "Sign Up"
   - Enter name, username, email, password
   - Check your email for OTP
   - Verify email with OTP

2. **Login**

   - Enter email and password
   - You'll be redirected to the home feed

3. **Complete your profile**

   - Click profile icon
   - Edit profile
   - Add bio, avatar, cover photo

4. **Start posting!**
   - Click "Create Post"
   - Write something or upload an image
   - Use #hashtags and @mentions

---

## 📁 Project Structure

```
social-media-dashboard/
├── backend/
│   ├── config/              # Database & Cloudinary config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, sanitization
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   ├── .env                 # Environment variables
│   ├── .env.example        # Env template
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── app/            # Redux store
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Redux slices
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Helper functions
│   ├── .env                # Environment variables
│   ├── .env.example       # Env template
│   └── index.html         # HTML entry point
│
├── README.md              # This file
└── package.json
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** with refresh tokens
- ✅ **Password Hashing** with bcrypt (10 salt rounds)
- ✅ **Email Verification** required before login
- ✅ **SQL Injection Prevention** (parameterized queries)
- ✅ **XSS Prevention** (input sanitization)
- ✅ **CSRF Protection** (SameSite cookies)
- ✅ **Rate Limiting** (5 attempts per 15 minutes on auth routes)
- ✅ **Helmet** security headers
- ✅ **CORS** configured properly
- ✅ **HTTP-only Cookies** for token storage

---

## 🧪 Testing

To test the database connection:

```bash
cd backend
node test-neon.js
```

Expected output:

```
✅ Connection: OK
✅ Database: social-media-dashboard
✅ Tables: 12
✅ Connection Pool: Active
```

---

## 📊 Database Schema

### **Main Tables**

- `users` - User accounts and profiles
- `posts` - User posts with images
- `comments` - Comments on posts
- `likes` - Post likes
- `reposts` - Post shares
- `follows` - User follow relationships
- `bookmarks` - Saved posts
- `notifications` - User notifications
- `hashtags` - Trending hashtags
- `post_hashtags` - Post-hashtag relationships
- `mentions` - User mentions in posts
- `refreshtokens` - JWT refresh tokens

---

## 🌐 API Endpoints

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### **Posts**

- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/explore` - Get explore posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/repost` - Repost
- `POST /api/posts/:id/bookmark` - Bookmark post

### **Users**

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following

### **Search & Trending**

- `GET /api/search?q=query&type=users` - Search
- `GET /api/trending/hashtags` - Trending hashtags
- `GET /api/trending/suggestions/users` - User suggestions

### **Notifications**

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/read` - Mark as read

---

## 🚢 Deployment

### **Backend (Render/Railway)**

1. Create new web service
2. Connect GitHub repository
3. Set environment variables from `.env`
4. Deploy!

### **Frontend (Vercel/Netlify)**

1. Create new project
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy!

### **Database**

Already on Neon (no additional deployment needed)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Neon](https://neon.tech/)
- [Cloudinary](https://cloudinary.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)

---

## 📞 Support

If you have any questions or run into issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact: ahsanarshad55565@gmail.com

---

## 🐛 Troubleshooting

### **Backend won't start**

```bash
# Make sure all dependencies are installed
npm install

# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID_NUMBER> /F
```

### **Database connection error**

- Verify `DATABASE_URL` in `.env` is correct
- Check Neon dashboard - is database active?
- Run `node test-neon.js` to test connection

### **Tables don't exist**

```bash
node utils/setup.js
```

### **CORS errors**

- Make sure backend is running on port 3000
- Check `CORS_ORIGIN` in backend `.env`
- Verify `VITE_API_URL` in frontend `.env`

### **Images not uploading**

- Check Cloudinary credentials in `.env`
- Verify file size < 10MB
- Check console for errors

---

## 🎉 Features Coming Soon

- [ ] Direct messaging
- [ ] Stories
- [ ] Video posts
- [ ] Live streaming
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

---

**Built with ❤️ using modern web technologies**
