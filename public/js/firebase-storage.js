// Firebase Storage Multiple File Uploader Module for Vintage Avenue with DataURL Fallback

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqGkAoBDT-uFjv941QohhlzhrzmwEiTeI",
  authDomain: "vintageavenuelb.firebaseapp.com",
  projectId: "vintageavenuelb",
  storageBucket: "vintageavenuelb.firebasestorage.app",
  messagingSenderId: "530041810571",
  appId: "1:530041810571:web:a572bbcf6a35862934ee8e",
  measurementId: "G-40WC04KER7"
};

let app, storage;
try {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
} catch (e) {
  console.warn('Firebase Storage initialization warning:', e);
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80');
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple File objects to Firebase Storage with automatic local Data URL fallback.
 * @param {FileList|File[]} files 
 * @param {Function} onProgress (percent, currentFileIndex, totalFiles)
 * @returns {Promise<string[]>} Array of Firebase Storage Download URLs or local Data URLs
 */
export async function uploadMultipleToFirebase(files, onProgress) {
  const downloadUrls = [];
  const fileArray = Array.from(files);

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];

    const url = await new Promise((resolve) => {
      let isSettled = false;
      
      // Safety timeout: fallback to FileReader DataURL if Firebase Storage stalls for > 3.5 seconds
      const timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.warn('Firebase Storage upload timeout, using local Data URL fallback for:', file.name);
          readFileAsDataURL(file).then(resolve);
        }
      }, 3500);

      try {
        if (!storage) throw new Error('Firebase Storage not initialized');

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `products/${timestamp}_${sanitizedName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress, i + 1, fileArray.length);
          },
          (error) => {
            console.warn('Firebase Storage upload error:', error);
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timeoutTimer);
              readFileAsDataURL(file).then(resolve);
            }
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (!isSettled) {
                isSettled = true;
                clearTimeout(timeoutTimer);
                resolve(downloadUrl);
              }
            } catch (err) {
              if (!isSettled) {
                isSettled = true;
                clearTimeout(timeoutTimer);
                readFileAsDataURL(file).then(resolve);
              }
            }
          }
        );
      } catch (err) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutTimer);
          readFileAsDataURL(file).then(resolve);
        }
      }
    });

    downloadUrls.push(url);
  }

  return downloadUrls;
}

window.uploadMultipleToFirebase = uploadMultipleToFirebase;
