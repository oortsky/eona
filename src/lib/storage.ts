import { storage, STORAGE_BUCKET_ID } from "@/lib/appwrite";
import { ID } from "appwrite";

/**
 * Upload file to Appwrite Storage (Client-side)
 * This needs to be done client-side because File object can't be serialized
 */
export async function uploadAttachment(file: File): Promise<{
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}> {
  try {
    const response = await storage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      file
    );

    const url = storage.getFileView(STORAGE_BUCKET_ID, response.$id);

    return {
      success: true,
      fileId: response.$id,
      url: url.toString()
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload file"
    };
  }
}

/**
 * Delete file from Appwrite Storage (Client-side)
 */
export async function deleteAttachment(fileId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    return { success: true };
  } catch (error: any) {
    console.error("Delete file error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete file"
    };
  }
}
