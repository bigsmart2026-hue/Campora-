import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MAX_FILE_SIZE = 500 * 1024; // 500KB limit for Firestore
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const JPEG_QUALITY = 0.7;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = (height / width) * MAX_WIDTH;
            width = MAX_WIDTH;
          } else {
            width = (width / height) * MAX_HEIGHT;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImagesToFirestore(
  files: File[],
  productId: string
): Promise<string[]> {
  const images: string[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      const compressed = await compressImage(file);
      images.push(compressed);
    } else {
      const base64 = await fileToBase64(file);
      images.push(base64);
    }
  }

  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    images: arrayUnion(...images),
  });

  return images;
}

export async function uploadAvatarToFirestore(
  file: File,
  userId: string
): Promise<string> {
  const compressed = await compressImage(file);
  
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    avatar: compressed,
  });

  return compressed;
}

export async function uploadVerificationDocsToFirestore(
  files: File[],
  _userId: string,
  _type: string
): Promise<string[]> {
  const images: string[] = [];

  for (const file of files) {
    if (file.type === 'application/pdf') {
      const base64 = await fileToBase64(file);
      images.push(base64);
    } else {
      const compressed = await compressImage(file);
      images.push(compressed);
    }
  }

  return images;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function validateFileSize(file: File, maxSizeKB: number = 500): boolean {
  return file.size <= maxSizeKB * 1024;
}

export function validateImageType(file: File): boolean {
  return file.type.startsWith('image/');
}
