🚑 Quick First Aids AI Assistant 🤖
<div align="center">
https://img.shields.io/github/stars/alibutt2882/Quick-First-Aids-Ai-Assistant?style=social
https://img.shields.io/github/forks/alibutt2882/Quick-First-Aids-Ai-Assistant?style=social
https://img.shields.io/github/issues/alibutt2882/Quick-First-Aids-Ai-Assistant
https://img.shields.io/github/license/alibutt2882/Quick-First-Aids-Ai-Assistant
https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white
https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white
https://img.shields.io/badge/Expo-50+-000020?logo=expo&logoColor=white
https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white

Live Demo • Report Bug • Request Feature

An intelligent AI-powered assistant that provides immediate first aid guidance during medical emergencies. 💊🏥

</div>
📋 Table of Contents
✨ Features

🚀 Getting Started

🏗️ Project Structure

🎯 Usage

🛠️ Technologies Used

🤝 Contributing

⚠️ Important Disclaimer

📄 License

👨‍⚕️ About the Developer

🌟 Support

✨ Features
🤖 AI-Powered Assistance
🧠 Smart Symptom Analysis – AI evaluates symptoms and provides tailored first aid steps

🗣️ Natural Language Processing – Conversational interface for easy interaction

⚡ Quick Response – Instant guidance during critical moments

🩺 Comprehensive First Aid Coverage
❤️ Cardiac Emergencies – CPR instructions, heart attack symptoms

🤕 Injuries – Cuts, burns, fractures, sprains

😵 Medical Conditions – Choking, seizures, allergic reactions

🌡️ Environmental – Heat stroke, hypothermia, poisoning

📱 User-Friendly Interface
📱 Mobile-Optimized – Accessible on any device (built with Expo)

🎯 Step-by-Step Guides – Clear, actionable instructions

🔍 Search Functionality – Quickly find specific first aid procedures

🚀 Getting Started
📋 Prerequisites
Python 3.8+

Node.js (for React Native/Expo development)

pip or conda

Docker (optional, for containerized setup)

⚙️ Installation
Backend Setup
bash
# Clone the repository
git clone https://github.com/alibutt2882/Quick-First-Aids-Ai-Assistant.git
cd Quick-First-Aids-Ai-Assistant

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configurations

# Run the application
python app.py
Frontend / Mobile App Setup
bash
# Navigate to the frontend directory (if separate)
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start the Expo development server
npm start
# or
yarn start

# For iOS simulator
npm run ios

# For Android emulator
npm run android
Docker Setup (Optional)
bash
# Build and run with Docker Compose
docker-compose up --build
🏗️ Project Structure
text
📁 Quick-First-Aids-Ai-Assistant/
├── 📁 .expo/                    # Expo configuration
├── 📁 app/                       # Main application code (Expo Router)
│   ├── 📁 (auth)/                # Authentication routes
│   ├── 📁 (tabs)/                # Tab-based navigation
│   └── 📁 +not-found.tsx         # 404 page
├── 📁 assets/                     # Images, fonts, etc.
├── 📁 components/                  # Reusable React components
├── 📁 constants/                   # App constants (Colors, etc.)
├── 📁 hooks/                       # Custom React hooks
├── 📁 scripts/                     # Utility scripts
├── 📁 src/                         # Source code (backend/AI)
│   ├── 📁 ai_models/               # AI/ML models
│   ├── 📁 database/                 # Data storage
│   └── 📁 utils/                    # Utility functions
├── 📁 tests/                        # Test files
├── app.json                         # Expo app configuration
├── app.py                           # Main Python backend application
├── babel.config.js                  # Babel configuration
├── docker-compose.yml               # Docker Compose setup
├── Dockerfile                       # Dockerfile for containerization
├── eas.json                         # EAS Build configuration
├── expo-env.d.ts                    # Expo environment types
├── global.css                       # Global styles (Tailwind)
├── gluestack-ui.config.json         # Gluestack UI configuration
├── metro.config.js                  # Metro bundler config
├── nativewind-env.d.ts              # NativeWind types
├── package.json                     # Node dependencies
├── requirements.txt                 # Python dependencies
├── tailwind.config.js               # Tailwind CSS config
└── tsconfig.json                    # TypeScript configuration
🎯 Usage
🖥️ Web Interface
Start the backend: python app.py

Start the frontend (if separate): npm start

Open browser to: http://localhost:5000 (or Expo dev server address)

Describe symptoms or emergency situation

Receive AI-generated first aid instructions

🐍 Python API
python
from first_aid_assistant import QuickFirstAidAI

assistant = QuickFirstAidAI()
response = assistant.get_first_aid("burn on hand")
print(response)
📱 Mobile App (Coming Soon!)
iOS and Android versions in development

Offline functionality for emergencies

GPS integration for nearby hospital locations

🛠️ Technologies Used
Technology	Purpose
Python 🐍	Backend & AI Logic
TensorFlow/PyTorch 🔥	Machine Learning Models
Flask/FastAPI ⚡	Web Framework
React Native / Expo ⚛️	Mobile Frontend
TypeScript	Type-safe JavaScript
Tailwind CSS / NativeWind 🎨	Styling
SQLite/PostgreSQL 🗄️	Database
Docker 🐳	Containerization
🤝 Contributing
We welcome contributions! 🎉

📝 How to Contribute
🍴 Fork the repository

🌿 Create a feature branch: git checkout -b feature/AmazingFeature

💾 Commit changes: git commit -m 'Add AmazingFeature'

📤 Push to branch: git push origin feature/AmazingFeature

🔀 Open a Pull Request

🎨 Contribution Areas
🧠 AI Model Improvements – Better symptom analysis

🩺 Medical Content – Additional first aid procedures

🎨 UI/UX Design – Better user experience

🌐 Localization – Translate to more languages

🧪 Testing – Improve test coverage

⚠️ Important Disclaimer
🚨 MEDICAL DISCLAIMER

This application provides first aid guidance only and is NOT a substitute for professional medical advice, diagnosis, or treatment.

ALWAYS seek immediate medical attention in emergencies by calling your local emergency number.

The AI assistant is trained on general first aid knowledge and may not cover all situations.

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

👨‍⚕️ About the Developer
Ali Butt 👨‍💻
https://img.shields.io/badge/GitHub-@alibutt2882-181717?logo=github

"Building technology to save lives, one line of code at a time." 💙

🌟 Support
If you find this project helpful, please consider:

⭐ Starring the repository

🐛 Reporting issues or bugs

💡 Suggesting new features

📢 Sharing with others who might benefit

<div align="center"> Made with ❤️ for first responders and everyday heroes </div>
