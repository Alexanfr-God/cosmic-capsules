
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the required storage bucket exists, creates it if it doesn't
 * @param bucketName The name of the bucket to check/create
 * @returns A promise that resolves to true if the bucket exists or was created successfully
 */
export const ensureStorageBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if storage bucket '${bucketName}' exists...`);
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Error listing storage buckets:`, listError);
      throw listError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists.`);
      return true;
    }
    
    console.log(`Bucket '${bucketName}' not found. Attempting to create it...`);
    
    // Try to create the bucket
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Error creating bucket '${bucketName}':`, createError);
      throw createError;
    }
    
    console.log(`Successfully created bucket '${bucketName}':`, newBucket);
    return true;
  } catch (error) {
    console.error(`Failed to ensure bucket '${bucketName}' exists:`, error);
    return false;
  }
};

/**
 * Uploads a file to a storage bucket
 * @param bucketName The name of the bucket to upload to
 * @param filePath The path where the file will be stored
 * @param file The file to upload
 * @returns The public URL of the uploaded file or null if upload failed
 */
export const uploadFileToBucket = async (
  bucketName: string,
  filePath: string,
  file: File
): Promise<string | null> => {
  try {
    console.log(`Uploading file to ${bucketName}/${filePath}...`);
    
    // Ensure bucket exists
    const bucketExists = await ensureStorageBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucketName}' does not exist and could not be created.`);
    }
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
      
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    console.log("File uploaded successfully. Public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
};
