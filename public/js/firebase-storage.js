// Firebase Storage Multiple File Uploader Module for Vintage Avenue

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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Upload multiple File objects to Firebase Storage.
 * @param {FileList|File[]} files 
 * @param {Function} onProgress (percent, currentFileIndex, totalFiles)
 * @returns {Promise<string[]>} Array of Firebase Storage Download URLs
 */
export async function uploadMultipleToFirebase(files, onProgress) {
  const downloadUrls = [];
  const fileArray = Array.from(files);

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `products/${timestamp}_${sanitizedName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress, i + 1, fileArray.length);
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          downloadUrls.push(url);
          resolve(url);
        }
      );
    });
  }

  return downloadUrls;
}

// Attach to window object for non-module scripts
window.uploadMultipleToFirebase = uploadMultipleToFirebase;
