import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from "../types";

// FIX: Removed conflicting global type declaration for 'window.aistudio'.
// The type is expected to be provided by the execution environment and re-declaring it was causing an error.

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY ortam değişkeni ayarlanmamış");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }
  
  throw new Error("API yanıtında resim verisi bulunamadı.");
};

export const generateTextSuggestion = async (imagePrompt: string, topic?: string): Promise<string> => {
  const ai = getAiClient();
  const systemInstruction = "Sen, bir görsele eklenecek kısa, yaratıcı ve etkileyici metinler üreten bir yapay zeka asistanısın. Cevapların sadece önerilen metni içermeli, başka hiçbir açıklama yapmamalıdır.";
  
  let userPrompt = `Bir kullanıcı, bir görüntüyü şu talimatla düzenliyor: "${imagePrompt}".`;

  if (topic && topic.trim() !== '') {
    userPrompt += ` Kullanıcı, metin önerisinin "${topic}" konusuyla ilgili olmasını istiyor.`;
  }
  
  userPrompt += ` Bu görüntüye eklenebilecek, bu talimatlarla uyumlu, kısa ve dikkat çekici bir metin öner. Örneğin, 'vintage filtre' için 'Geçmişin Renkleri' gibi. Sadece metni döndür.`;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
          systemInstruction: systemInstruction,
      },
  });

  const text = response.text.trim();
  if (!text) {
    throw new Error("Yapay zeka bir metin önerisi oluşturamadı.");
  }
  // Modelin tırnak içinde döndürme ihtimaline karşı temizleyelim
  return text.replace(/^"|"$/g, '');
};


// FIX: Added 'animateImage' function to generate video from an image.
export const animateImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  const ai = getAiClient();

  onProgress("Video oluşturma işlemi başlatılıyor...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  onProgress("İşlem oluşturuldu, video oluşturuluyor. Bu işlem birkaç dakika sürebilir...");
  
  const progressMessages = [
      "Model ısınıyor...",
      "Video için ilk kareler oluşturuluyor...",
      "Hareket yolları hesaplanıyor...",
      "Video kareleri işleniyor...",
      "Neredeyse bitti, son rötuşlar yapılıyor..."
  ];
  let pollCount = 0;

  while (!operation.done) {
    onProgress(progressMessages[pollCount % progressMessages.length]);
    pollCount++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  onProgress("Video oluşturuldu! İndiriliyor...");

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!downloadLink) {
    throw new Error("Oluşturulan video bağlantısı bulunamadı.");
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      throw new Error("API_KEY ortam değişkeni ayarlanmamış");
  }

  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Video indirme hatası:", errorText);
    throw new Error(`Video indirilemedi: ${response.statusText}`);
  }
  const videoBlob = await response.blob();
  const videoUrl = URL.createObjectURL(videoBlob);
  
  onProgress("Video hazır!");
  
  return videoUrl;
};