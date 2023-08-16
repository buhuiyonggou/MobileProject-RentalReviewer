import { getDownloadURL, ref } from "@firebase/storage";
import { storage } from "../Firebase/firebase-setup";

// Download image from storage
export async function downloadImages(reviewData) {
  const imageUris = [];

  for (const imagePath of reviewData.images) {
    const imageRef = ref(storage, imagePath);
    try {
      const url = await getDownloadURL(imageRef);
      imageUris.push(url);
    } catch (error) {
      console.error(
        "Error fetching the download URL for",
        imagePath,
        ":",
        error
      );
    }
  }
  return imageUris;
}
