import React, { useState, useEffect, useCallback } from 'react';
import { animateImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import type { AspectRatio } from '../types';
import { Spinner } from './ui/Spinner';
import { IconUpload, IconMoviePlay, IconDownload } from './ui/Icons';

const VideoAnimator: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [sourceImage, setSourceImage] = useState<{ file: File; url: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      } else {
        setApiKeySelected(false);
      }
    } catch(e) {
      console.warn("aistudio bağlamı mevcut değil. API anahtarının ortam aracılığıyla ayarlandığı varsayılıyor.", e);
      setApiKeySelected(true); // aistudio olmayan ortamlar için yedek
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Yarış durumunu önlemek ve yeniden kontrol etmek için başarı varsay
      setApiKeySelected(true);
    } catch(e) {
      console.error("API anahtarı iletişim kutusu açılamadı", e);
      setError("API anahtarı seçimi açılamadı. Lütfen desteklenen bir ortamda olduğunuzdan emin olun.");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceImage({ file, url: URL.createObjectURL(file) });
      setVideoUrl(null);
      setError(null);
    }
  };

  const handleProgress = (message: string) => {
    setLoadingMessage(message);
  };
  
  const handleSubmit = useCallback(async () => {
    if (!sourceImage || !prompt) {
      setError("Lütfen bir resim yükleyin ve bir canlandırma istemi girin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const base64Image = await fileToBase64(sourceImage.file);
      const generatedVideoUrl = await animateImage(base64Image, sourceImage.file.type, prompt, aspectRatio, handleProgress);
      setVideoUrl(generatedVideoUrl);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu.";
      setError(errorMessage);
      if(errorMessage.includes("Requested entity was not found")) {
          setError("API Anahtarı geçersiz. Lütfen geçerli bir API anahtarı seçin.");
          setApiKeySelected(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [sourceImage, prompt, aspectRatio]);

  if (!apiKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 p-8 rounded-xl border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4">Veo için API Anahtarı Gerekli</h2>
        <p className="text-gray-400 mb-6 max-w-md">Video oluşturmak için bir Google AI Studio API anahtarı seçmeniz gerekir. Bu, faturalandırma amacıyla kullanılacaktır.</p>
        <button 
          onClick={handleSelectKey}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200"
        >
          API Anahtarı Seç
        </button>
         <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-4">
          Faturalandırma hakkında daha fazla bilgi edinin
        </a>
        {error && <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
         <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[250px]">
            {sourceImage ? (
              <img src={sourceImage.url} alt="Video için kaynak" className="max-h-64 rounded-md object-contain" />
            ) : (
              <>
                <IconUpload className="w-12 h-12 text-gray-500 mb-2" />
                <label htmlFor="video-image-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                  Resim Yükle
                </label>
                <input id="video-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <p className="text-xs text-gray-500 mt-2">Video için bir başlangıç resmi yükleyin</p>
              </>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Canlandırmayı açıklayın, örn. 'Hafif bir esinti yaprakları hışırdatıyor' veya 'Kişi gülümsüyor ve el sallıyor'"
              className="w-full h-24 p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={!sourceImage || isLoading}
            />
            <div>
                <span className="text-sm font-medium text-gray-400">En Boy Oranı:</span>
                <div className="flex gap-4 mt-2">
                    {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <label key={ratio} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="aspectRatio" 
                                value={ratio} 
                                checked={aspectRatio === ratio} 
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                className="form-radio h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <span className="text-gray-300">{ratio === '16:9' ? 'Yatay' : 'Dikey'}</span>
                        </label>
                    ))}
                </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!sourceImage || !prompt || isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? <Spinner /> : <IconMoviePlay className="w-5 h-5 mr-2" />}
              Video Oluştur
            </button>
          </div>
        </div>
      </div>
      
      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md text-center">{error}</div>}

      {(isLoading || videoUrl) && (
        <div className="bg-gray-800/30 p-4 sm:p-6 rounded-xl flex flex-col items-center justify-center">
            {isLoading && (
                <div className="text-center p-4">
                    <Spinner />
                    <p className="mt-4 text-gray-300 font-medium">Video Oluşturuluyor...</p>
                    <p className="mt-2 text-sm text-gray-400 max-w-md">{loadingMessage}</p>
                </div>
            )}
            {videoUrl && !isLoading && (
                <div className="w-full">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-center text-gray-300">Oluşturulan Video</h3>
                        <a
                            href={videoUrl}
                            download="olusturulan-video.mp4"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            aria-label="Oluşturulan videoyu indir"
                        >
                            <IconDownload className="w-5 h-5 mr-2" />
                            İndir
                        </a>
                    </div>
                    <video src={videoUrl} controls autoPlay loop className="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
                        Tarayıcınız video etiketini desteklemiyor.
                    </video>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default VideoAnimator;