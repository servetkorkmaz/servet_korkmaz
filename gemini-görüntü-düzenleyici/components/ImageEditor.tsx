import React, { useState, useCallback } from 'react';
import { editImage, generateTextSuggestion } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Spinner } from './ui/Spinner';
import { IconUpload, IconWand, IconDownload, IconSparkles } from './ui/Icons';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState<string>('');
  const [textToAdd, setTextToAdd] = useState<string>('');
  const [suggestionTopic, setSuggestionTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImageUrl(null);
      setError(null);
      setPrompt('');
      setTextToAdd('');
      setSuggestionTopic('');
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError("Lütfen bir resim yükleyin ve bir düzenleme istemi girin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    const combinedPrompt = textToAdd
      ? `${prompt}. Ayrıca, "${textToAdd}" metnini görsele estetik ve okunaklı bir şekilde ekle.`
      : prompt;

    try {
      const base64Image = await fileToBase64(originalImage.file);
      const newImageBase64 = await editImage(base64Image, originalImage.file.type, combinedPrompt);
      const imageUrl = `data:image/png;base64,${newImageBase64}`;
      setEditedImageUrl(imageUrl);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, textToAdd]);

  const handleGenerateText = useCallback(async () => {
    if (!prompt) {
      setError("Lütfen önce bir düzenleme talimatı girin.");
      return;
    }
    setIsGeneratingText(true);
    setError(null);
    try {
      const suggestion = await generateTextSuggestion(prompt, suggestionTopic);
      setTextToAdd(suggestion);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Metin önerisi alınamadı.");
    } finally {
      setIsGeneratingText(false);
    }
  }, [prompt, suggestionTopic]);

  const examplePrompts = ["Retro, vintage bir filtre ekle", "Sulu boya tablo gibi görünmesini sağla", "Ön plana sevimli, gülümseyen bir kedi ekle", "Arka plandaki kişiyi kaldır"];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Upload Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[300px]">
            {originalImage ? (
              <img src={originalImage.url} alt="Orijinal" className="max-h-72 rounded-md object-contain" />
            ) : (
              <>
                <IconUpload className="w-12 h-12 text-gray-500 mb-2" />
                <label htmlFor="image-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                  1. Resim Yükle
                </label>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <p className="text-xs text-gray-500 mt-2">Başlangıç için bir resim yükleyin</p>
              </>
            )}
          </div>
          {/* Main Prompt Area */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <label htmlFor="prompt-textarea" className="font-semibold text-gray-300">2. Düzenleme Talimatı</label>
            <textarea
              id="prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Görselde ne gibi değişiklikler yapmak istersiniz?"
              className="w-full h-32 p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={!originalImage || isLoading}
            />
             <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 self-center">Örnekler:</span>
              {examplePrompts.map(p => (
                <button key={p} onClick={() => setPrompt(p)} disabled={!originalImage || isLoading} className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 px-2 py-1 rounded-full transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Text To Add Area */}
        <div className="mt-6">
            <label htmlFor="text-to-add-input" className="font-semibold text-gray-300">3. Metin Ekle (İsteğe Bağlı)</label>
            <input
              id="text-to-add-input"
              type="text"
              value={textToAdd}
              onChange={(e) => setTextToAdd(e.target.value)}
              placeholder="Görselin üzerine eklemek istediğiniz metni buraya yazın..."
              className="w-full p-3 mt-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={!originalImage || isLoading}
            />
            <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-2">
                <input
                    type="text"
                    value={suggestionTopic}
                    onChange={(e) => setSuggestionTopic(e.target.value)}
                    placeholder="Ne hakkında öneri istersiniz? (örn: komik bir başlık)"
                    className="flex-grow p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow disabled:opacity-50"
                    disabled={!prompt || isLoading || isGeneratingText}
                />
                <button
                onClick={handleGenerateText}
                disabled={!prompt || isLoading || isGeneratingText}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 border border-purple-500/50 text-purple-300 rounded-md hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {isGeneratingText ? <Spinner /> : <IconSparkles className="w-5 h-5" />}
                <span>{isGeneratingText ? 'Oluşturuluyor...' : 'Yapay Zeka ile Öneri Al'}</span>
                </button>
            </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!originalImage || !prompt || isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? <Spinner /> : <IconWand className="w-5 h-5 mr-2" />}
              Düzenlemeyi Oluştur
            </button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md text-center">{error}</div>}
      
      {isLoading && (
        <div className="text-center p-4">
          <Spinner />
          <p className="mt-2 text-gray-400">Düzenleme yapılıyor... Lütfen bekleyin.</p>
        </div>
      )}

      {editedImageUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/30 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-400">Orijinal</h3>
            <img src={originalImage?.url} alt="Orijinal" className="w-full rounded-md" />
          </div>
          <div className="bg-gray-800/30 p-4 rounded-xl flex flex-col gap-4">
             <div className="flex justify-center items-center gap-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-400">Düzenlenmiş</h3>
                <a
                    href={editedImageUrl}
                    download="duzenlenmis-resim.png"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    aria-label="Düzenlenen resmi indir"
                >
                    <IconDownload className="w-4 h-4 mr-1" />
                    İndir
                </a>
            </div>
            <img src={editedImageUrl} alt="Düzenlenmiş" className="w-full rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;