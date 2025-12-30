# Recipe Realm 🥗

A modern, feature-rich vegetarian recipe sharing web application built with React, Firebase, and Tailwind CSS.

## Features

### Core Functionality
- **User Authentication**: Secure email/password signup and login with unique usernames
- **Recipe Management**: Create, edit, delete, and organize your vegetarian recipes
- **Recipe Discovery**: Browse and search public recipes by title, description, or tags
- **Social Features**: Follow other users, view profiles, and discover community recipes
- **Recipe Rating**: Rate recipes and see community ratings (1-5 stars)

### Recipe Features
- **Custom Tags**: Use predefined tags or create your own custom tags (up to 5 per recipe)
- **Servings Scaler**: Automatically adjust ingredient quantities based on desired servings
- **Recipe Copying**: Save other users' recipes to your collection with attribution
- **Recipe Sharing**: Generate shareable links to recipes
- **Recipe Folders**: Organize your recipes into custom folders

### Shopping List
- **Smart Shopping List**: Add ingredients from recipes directly to your shopping list
- **Manual Items**: Add custom items with quantities and categories
- **Common Foods**: Maintain a list of pantry staples to auto-exclude when adding recipes
- **Recurring Items**: Set up recurring shopping items with custom frequencies
- **Category Organization**: Items organized by category (produce, dairy, pantry, etc.)

### Advanced Features
- **Leftover Scanner**: Find recipes based on ingredients you have (fuzzy matching with 80%+ match threshold)
- **Personal Favorites**: Star your favorite recipes for quick access
- **User Profiles**: View other users' profiles with their public recipes and stats
- **Following System**: Follow users to see their recipes in your feed

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router (Hash routing for GitHub Pages)
- **Deployment**: GitHub Pages via `gh-pages` package
- **Code Quality**: ESLint + Prettier

## Project Structure

```
recipe-realm/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── recipes/           # Recipe-related components
│   │   ├── shopping/          # Shopping list components (future)
│   │   ├── social/            # Social features (future)
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Firebase service layer
│   ├── utils/                 # Utility functions
│   ├── constants/             # Constants and validation rules
│   ├── context/               # React contexts
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Firebase account (already configured in this project)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Linskii/recipe-realm.git
cd recipe-realm
```

2. Install dependencies:
```bash
npm install
```

3. The Firebase configuration is already included in `src/services/firebase.js` (no environment variables needed).

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run deploy` - Deploy to GitHub Pages

## Firebase Configuration

### Required Firestore Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

1. **Collection:** `recipes`
   - Fields: `isPublic` (Ascending), `createdAt` (Descending)

2. **Collection:** `recipes`
   - Fields: `createdBy` (Ascending), `createdAt` (Descending)

3. **Collection:** `recipes`
   - Fields: `isPublic` (Ascending), `averageRating` (Descending)

4. **Collection:** `recipes`
   - Fields: `isPublic` (Ascending), `prepTime` (Ascending), `cookTime` (Ascending)

These will be automatically suggested by Firebase when you first use the app.

## Deployment to GitHub Pages

1. Update the `base` path in `vite.config.js` if your repository name is different:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/recipe-realm/', // Change to match your repo name
});
```

2. Build and deploy:
```bash
npm run deploy
```

The app will be deployed to `https://yourusername.github.io/recipe-realm/`

## Database Structure

### Collections

- **users**: User profiles with stats
- **recipes**: All recipes (public and private)
- **ratings**: User ratings for recipes
- **follows**: User follow relationships

### User Subcollections
- **users/{userId}/favorites**: User's favorited recipes
- **users/{userId}/shoppingList**: User's shopping list items
- **users/{userId}/folders**: User's recipe organization folders
- **users/{userId}/recurringItems**: Recurring shopping list items
- **users/{userId}/commonFoods**: User's common pantry items

## Features Not Included

- **Image Uploads**: Firebase Storage is not used. All recipes display placeholder veggie icons (🥗).
- **Real-time Messaging**: No chat or messaging features.
- **Email Notifications**: No email integration.

## Code Quality

This project follows clean code principles:

- **DRY (Don't Repeat Yourself)**: Reusable components and utility functions
- **Single Responsibility**: Each component/function has one clear purpose
- **Consistent Patterns**: Standardized error handling, loading states, and data fetching
- **Input Validation**: Client-side validation before Firebase calls
- **Error Boundaries**: Proper error handling throughout
- **ESLint + Prettier**: Code formatting and linting configured

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- Touch-friendly UI elements (44px minimum touch targets)

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

ISC

## Acknowledgments

- Firebase for backend services
- Tailwind CSS for styling
- React and Vite for the development experience
- The vegetarian cooking community for inspiration

---

Built with ❤️ for vegetarian food lovers
