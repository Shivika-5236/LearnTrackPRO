# LearnTrack PRO

A comprehensive mobile application for students to track their academic journey, manage courses, study sessions, tasks, and analyze their learning progress.

## 📱 Features

### 🎓 Course Management
- Track multiple courses with details (title, instructor, hours, credits)
- Manage assignments and projects per course
- Monitor course progress
- Filter courses by type (College/Self)

### 📚 Study Sessions
- Create and manage focus blocks for structured study sessions
- **Flag important moments** during study sessions
- **Pause and resume** study sessions
- Track study history with detailed logs
- Visual progress tracking

### ✅ Task Management
- Create tasks with priorities (High, Medium, Low)
- Set deadlines with calendar and time pickers
- Organize tasks by status (Not Started, Doing, Completed)
- Track task completion rates

### 📊 Analytics
- Real-time study hours tracking
- Task completion statistics
- Course progress analytics
- Visual insights with charts

### 🎨 UI/UX Features
- **Dark/Light mode** support
- Consistent, modern design across all screens
- Custom **splash screen** with logo (3 seconds)
- Smooth animations and transitions
- FAB (Floating Action Buttons) for quick actions

### 🔒 Security
- **Authenticated access only** - login/signup required
- Swipe gestures disabled on auth screens
- SQLite database for local data storage
- User profile management

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite (expo-sqlite)
- **UI Components**: React Native
- **Icons**: @expo/vector-icons
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- iOS Simulator (Mac only) or Android Emulator (optional)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LearnTrackPRO
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (iOS) or Camera app (Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## 📱 Platform Support

- ✅ **iOS** - Full support
- ✅ **Android** - Full support
- ❌ **Web** - Not supported (SQLite limitation)

## 📂 Project Structure

```
LearnTrackPRO/
├── app/                    # App screens (file-based routing)
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── courses.tsx    # Courses screen
│   │   ├── study.tsx      # Study logs screen
│   │   ├── tasks.tsx      # Tasks screen
│   │   ├── analytics.tsx  # Analytics screen
│   │   └── settings.tsx   # Settings screen
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── signup.tsx     # Signup screen
│   ├── study/             # Study-related screens
│   ├── tasks/             # Task-related screens
│   ├── courses/           # Course-related screens
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   ├── CalendarPicker.tsx # Custom calendar picker
│   ├── CustomSplash.tsx   # Splash screen component
│   └── Sidebar.tsx        # Navigation sidebar
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── ThemeContext.tsx   # Dark/Light mode
│   ├── CourseContext.tsx  # Course management
│   ├── StudyContext.tsx   # Study session state
│   └── TaskContext.tsx    # Task management
├── services/              # Database and business logic
│   ├── database.ts        # SQLite setup & migrations
│   ├── userService.ts     # User operations
│   ├── courseService.ts   # Course operations
│   ├── studyService.ts    # Study session operations
│   └── taskService.ts     # Task operations
├── assets/                # Images, fonts, etc.
└── constants/             # Theme colors, configs

```

## 🎯 Key Features Explained

### Authentication Flow
- First-time users must sign up with name, email, college, and password
- Returning users login with email and password
- Authentication state persists using SQLite
- Automatic redirection based on auth status

### Study Session Management
- Create focus blocks with title, duration, and details
- Start sessions with timer and flag functionality
- Pause/resume sessions (state persists in database)
- View flagged timestamps as history
- Track all completed sessions

### Database Schema
- **users**: User accounts and profiles
- **courses**: Course information
- **assignments**: Course assignments
- **projects**: Course projects
- **focus_blocks**: Study sessions with state
- **study_sessions**: Completed study logs
- **tasks**: User tasks

## ⚙️ Configuration

### Environment Variables
No environment variables required - all data is stored locally in SQLite.

### Customization
- **Splash Screen**: Replace `assets/images/logo.png` with your logo
- **Theme Colors**: Edit `constants/theme.ts`
- **Database**: Migrations run automatically on app start

## 🐛 Known Issues

- Web platform not supported due to SQLite dependency
- Expo version warning (54.0.24 vs 54.0.25) - does not affect functionality

## 📄 License

This project is created for academic purposes.

## 👤 Author

**Shivika**
- College: PST

## 🙏 Acknowledgments

- Built with Expo and React Native
- Icons from @expo/vector-icons
- SQLite for local data persistence

---

**Made with ❤️ for students to track their academic journey**
