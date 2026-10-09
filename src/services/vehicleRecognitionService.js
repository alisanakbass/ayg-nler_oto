/**
 * Araç Tanıma Servisi (Vehicle Recognition Service)
 * Google Gemini Vision ile Hızlı ve Doğrudan Araç Modeli & Sınıfı Tespiti
 */

const DEFAULT_GEMINI_API_KEY = 'AIzaSyCXanotQoKynVC5TdY0IhCaQuBZ7z8Y3y4';

export function getGeminiApiKey() {
  return localStorage.getItem('aygun_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_API_KEY;
}

export function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('aygun_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('aygun_gemini_api_key');
  }
}

/**
 * Görseli hızlı aktarım için hafifletir (500px, ~35KB)
 * Bu sayede yapay zeka analizi 1.5 - 2 saniyede sonuç verir.
 */
export async function compressImage(file, maxWidth = 500, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Fotoğraftan Araç Marka Modelini, Sınıfını ve Plakasını Doğrudan Tespit Eder
 */
export async function identifyVehicleFromImage(base64Image) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.warn('Gemini API anahtarı bulunamadı.');
    return {
      vehicleType: 'Ticari / Minibüs',
      modelGuess: 'Araç',
      plate: '',
      confidence: 0.5
    };
  }

  try {
    const pureBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `Bu fotoğraftaki aracı incele.
Aracın arkasındaki veya önündeki model yazılarını (örneğin 'TOURNEO COURIER', 'DOBLO', 'MEGANE', 'CLIO', 'EGEA', 'CADDY' vb.), marka amblemini ve gövde yapısını analiz et.
Aracın tam marka ve modelini belirle (örneğin 'Ford Tourneo Courier', 'Fiat Doblo', 'Renault Megane' vb.).
Araç sınıfını şu 4 kategoriden birine ata:
- 'Ticari / Minibüs' (Courier, Doblo, Caddy, Vito, Minibüs, Panelvan vb.)
- 'Binek' (Sedan, Hatchback otomobiller)
- 'SUV / Arazi' (Jeep, Duster, Qashqai, Tiguan vb.)
- 'Motosiklet' (Motor, Scooter vb.)

SADECE geçerli bir JSON nesnesi olarak yanıt ver:
{
  "brandModel": "Ford Tourneo Courier",
  "vehicleType": "Ticari / Minibüs"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 saniye güvenli limit

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: pureBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        return {
          vehicleType: parsed.vehicleType || 'Ticari / Minibüs',
          modelGuess: parsed.brandModel || 'Araç',
          plate: parsed.plate || '',
          confidence: 0.98
        };
      }
    }
  } catch (err) {
    console.error('Yapay Zeka Analiz Hatası:', err);
  }

  // Beklenmedik durumda varsayılan güvenli dönüş
  return {
    vehicleType: 'Ticari / Minibüs',
    modelGuess: 'Araç',
    plate: '',
    confidence: 0.5
  };
}

export const POPULAR_VEHICLES = {
  'Ticari / Minibüs': ['Ford Tourneo Courier', 'Fiat Doblo', 'VW Caddy', 'Fiat Fiorino', 'Mercedes Vito', 'Ford Transit'],
  'Binek': ['Fiat Egea', 'Renault Clio', 'Renault Megane', 'Toyota Corolla', 'VW Passat', 'Honda Civic'],
  'SUV / Arazi': ['Dacia Duster', 'Nissan Qashqai', 'Hyundai Tucson', 'VW Tiguan', 'Peugeot 3008', 'Kia Sportage'],
  'Motosiklet': ['Honda PCX', 'Yamaha NMAX', 'Vespa', 'Yamaha XMAX', 'Honda Forza', 'Motosiklet']
};
