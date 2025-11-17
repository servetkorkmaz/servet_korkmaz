import React from 'react';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Gemini Görüntü Düzenleyici
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <ImageEditor />
      </main>

      <footer className="text-center p-4 text-xs text-gray-500">
        Google Gemini tarafından desteklenmektedir
      </footer>
    </div>
  );
};

export default App;
