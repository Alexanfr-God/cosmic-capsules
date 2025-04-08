
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to the specified bucket with the given path
 */
export const uploadFileToBucket = async (
  bucketName: string,
  filePath: string,
  file: File
): Promise<string | null> => {
  try {
    console.log(`Uploading file to bucket ${bucketName} at path ${filePath}`);
    
    // Ensure the bucket exists
    await ensureStorageBucketExists(bucketName);
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded file
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log("File uploaded successfully:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

/**
 * Ensures that the specified storage bucket exists, creates it if it doesn't
 */
export const ensureStorageBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if bucket ${bucketName} exists`);
    
    // Get list of all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      // Don't throw error here, try to create bucket anyway
    }
    
    // Check if the bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist, creating it...`);
      
      // Check if bucket with same name already exists
      const checkBucketResponse = await supabase.storage
        .getBucket(bucketName);
      
      // If the bucket already exists, return true
      if (checkBucketResponse.data) {
        console.log(`Bucket ${bucketName} already exists according to getBucket`);
        return true;
      }
      
      // Create the bucket with public access
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        
        // If the bucket already exists (concurrent creation), ignore the error
        if (createError.message?.includes("already exists")) {
          console.log("Bucket already exists, concurrent creation detected");
          return true;
        }
        
        // Attempt to continue without throwing an error
        console.log("Continuing despite bucket creation error");
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    // Continue without the bucket rather than failing the entire process
    return false;
  }
};
