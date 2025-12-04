# LearnTrack PRO

LearnTrack PRO is a mobile app for students to manage their courses, study sessions, tasks, and learning analytics. Built with Expo and React Native, it provides a simple and organized workflow with local data stored using SQLite.

## Features
- Course tracking with assignments and progress
- Study sessions with flags, pause/resume, and history logs
- Task management with priorities and deadlines
- Analytics for study hours, tasks, and course progress

## Tech Stack
- Expo (React Native)
- TypeScript
- Expo Router
- SQLite (expo-sqlite)
- React Context API

## Installation

Follow the steps below to set up and run the project locally.

## Clone the repository
bash
git clone <your-repo-url>
cd LearnTrackPRO

Install all dependencies
bash
Copy code
npm install

Start the development server
bash
Copy code
npx expo start

Run the app
On a physical device
Install Expo Go from the App Store (iOS) or Play Store (Android).
Open Expo Go.
Scan the QR code displayed in your terminal or browser after running expo start.


## Platform Support

iOS – Supported
Android – Supported
Web – Not supported (SQLite limitation)

## Notes

Authentication state is stored locally
Database migrations run automatically
