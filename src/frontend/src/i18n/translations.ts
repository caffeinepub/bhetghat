export const translations = {
  en: {
    // App name
    appName: 'Bhetghat',
    appMotto: 'Good for casual contact or relationship',
    
    // Navigation
    home: 'Home',
    matches: 'Matches',
    profile: 'Profile',
    settings: 'Settings',
    installHelp: 'Install App',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    loginPrompt: 'Login to start matching',
    loginDescription: 'Connect with your Internet Identity to create your profile and start meeting people.',
    
    // Offline
    offline: 'You are offline',
    offlineDescription: 'Please check your internet connection to continue using Bhetghat.',
    
    // Install Help
    installTitle: 'Install Bhetghat',
    installDescription: 'Add Bhetghat to your home screen for the best experience.',
    androidTitle: 'On Android (Chrome)',
    androidStep1: 'Open this website in Chrome browser',
    androidStep2: 'Tap the menu (three dots) in the top right',
    androidStep3: 'Tap "Add to Home screen"',
    androidStep4: 'Tap "Add" to confirm',
    iosTitle: 'On iPhone (Safari)',
    iosStep1: 'Open this website in Safari browser',
    iosStep2: 'Tap the Share button (square with arrow)',
    iosStep3: 'Scroll down and tap "Add to Home Screen"',
    iosStep4: 'Tap "Add" to confirm',
    installNote: 'After installation, the app will open full-screen like a native app.',
    
    // Welcome
    welcomeTitle: 'Welcome to Bhetghat',
    welcomeSubtitle: 'Find meaningful connections',
    getStarted: 'Get Started',
    
    // Language
    language: 'Language',
    english: 'English',
    nepali: 'नेपाली',
    
    // Footer
    builtWith: 'Built with',
    love: 'love',
    using: 'using',
  },
  ne: {
    // App name
    appName: 'भेटघाट',
    appMotto: 'अनौपचारिक सम्पर्क वा सम्बन्धको लागि राम्रो',
    
    // Navigation
    home: 'गृहपृष्ठ',
    matches: 'म्याचहरू',
    profile: 'प्रोफाइल',
    settings: 'सेटिङहरू',
    installHelp: 'एप इन्स्टल गर्नुहोस्',
    
    // Auth
    login: 'लगइन',
    logout: 'लगआउट',
    loginPrompt: 'म्याचिङ सुरु गर्न लगइन गर्नुहोस्',
    loginDescription: 'आफ्नो प्रोफाइल बनाउन र मानिसहरूलाई भेट्न सुरु गर्न आफ्नो इन्टरनेट पहिचानसँग जडान गर्नुहोस्।',
    
    // Offline
    offline: 'तपाईं अफलाइन हुनुहुन्छ',
    offlineDescription: 'भेटघाट प्रयोग जारी राख्न कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।',
    
    // Install Help
    installTitle: 'भेटघाट इन्स्टल गर्नुहोस्',
    installDescription: 'उत्तम अनुभवको लागि आफ्नो होम स्क्रिनमा भेटघाट थप्नुहोस्।',
    androidTitle: 'एन्ड्रोइडमा (क्रोम)',
    androidStep1: 'यो वेबसाइट क्रोम ब्राउजरमा खोल्नुहोस्',
    androidStep2: 'माथि दायाँमा मेनु (तीन थोप्ला) ट्याप गर्नुहोस्',
    androidStep3: '"होम स्क्रिनमा थप्नुहोस्" ट्याप गर्नुहोस्',
    androidStep4: 'पुष्टि गर्न "थप्नुहोस्" ट्याप गर्नुहोस्',
    iosTitle: 'आईफोनमा (सफारी)',
    iosStep1: 'यो वेबसाइट सफारी ब्राउजरमा खोल्नुहोस्',
    iosStep2: 'शेयर बटन (तीरसहितको वर्ग) ट्याप गर्नुहोस्',
    iosStep3: 'तल स्क्रोल गर्नुहोस् र "होम स्क्रिनमा थप्नुहोस्" ट्याप गर्नुहोस्',
    iosStep4: 'पुष्टि गर्न "थप्नुहोस्" ट्याप गर्नुहोस्',
    installNote: 'इन्स्टलेसन पछि, एप नेटिभ एप जस्तै पूर्ण-स्क्रिन खुल्नेछ।',
    
    // Welcome
    welcomeTitle: 'भेटघाटमा स्वागत छ',
    welcomeSubtitle: 'अर्थपूर्ण जडानहरू फेला पार्नुहोस्',
    getStarted: 'सुरु गर्नुहोस्',
    
    // Language
    language: 'भाषा',
    english: 'English',
    nepali: 'नेपाली',
    
    // Footer
    builtWith: 'निर्माण गरिएको',
    love: 'माया',
    using: 'प्रयोग गरेर',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
