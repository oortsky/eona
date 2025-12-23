import {
  databases,
  storage,
  DATABASE_ID,
  CAPSULE_COLLECTION_ID,
  STORAGE_BUCKET_ID
} from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import type { Capsule, Footprint, Attachment } from "@/types/capsule";
import {
  hashCode,
  encryptMessage,
  decryptMessage,
  verifyCode
} from "@/utils/encryption";
import { calculateDistance, isLocationValid } from "@/utils/geolocation";

/**
 * CREATE - Create new capsule
 */
export async function createCapsule(formData: {
  userId: string;
  userEmail: string;
  name: string;
  message: string;
  code: string;
  lockedUntil: string;
  footprint: Footprint | null;
  attachmentData?: Attachment | null;
}) {
  try {
    const hashedCode = await hashCode(formData.code);
    const encryptedMessage = encryptMessage(formData.message, formData.code);

    const capsuleData = {
      user_id: formData.userId,
      user_email: formData.userEmail,
      name: formData.name,
      message: encryptedMessage,
      code: hashedCode,
      locked_until: formData.lockedUntil,
      footprint: JSON.stringify(formData.footprint),
      attachment: formData.attachmentData
        ? JSON.stringify(formData.attachmentData)
        : null,
      is_opened: false
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      ID.unique(),
      capsuleData
    );

    return {
      success: true,
      capsule: response as unknown as Capsule
    };
  } catch (error: any) {
    console.error("Create capsule error:", error);
    return {
      success: false,
      error: error.message || "Failed to create capsule"
    };
  }
}

/**
 * READ - Get capsule(s) by ID, user_id, or user_email
 *
 * @param identifier - Document ID, user_id, or user_email
 * @param type - Type of identifier: "id" | "user_id" | "user_email"
 * @param limit - Optional limit for pagination (undefined = get all)
 * @param offset - Offset for pagination
 *
 * Examples:
 * - getCapsule("doc123", "id") → single capsule by document ID
 * - getCapsule("user123", "user_id") → all capsules for user
 * - getCapsule("user@email.com", "user_email", 25, 0) → paginated capsules by email
 */
export async function getCapsule(
  identifier: string,
  type: "id" | "user_id" | "user_email" = "id",
  limit?: number,
  offset = 0
) {
  try {
    if (type === "id") {
      const response = await databases.getDocument(
        DATABASE_ID,
        CAPSULE_COLLECTION_ID,
        identifier
      );

      return {
        success: true,
        capsule: response as unknown as Capsule,
        capsules: [response as unknown as Capsule],
        total: 1
      };
    }

    const query =
      type === "user_id"
        ? Query.equal("user_id", identifier)
        : Query.equal("user_email", identifier);

    const queries = [query, Query.orderDesc("$createdAt")];

    if (limit !== undefined) {
      queries.push(Query.limit(limit));
      queries.push(Query.offset(offset));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      queries
    );

    return {
      success: true,
      capsule: response.documents[0] as unknown as Capsule | undefined,
      capsules: response.documents as unknown as Capsule[],
      total: response.total
    };
  } catch (error: any) {
    console.error("Get capsule error:", error);
    return {
      success: false,
      capsule: null,
      capsules: [],
      total: 0,
      error: error.message
    };
  }
}

/**
 * READ - Get total capsules count (globally)
 */
export async function getTotalCapsules() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      [Query.limit(1)]
    );

    return {
      success: true,
      total: response.total
    };
  } catch (error: any) {
    console.error("Get total capsules error:", error);
    return {
      success: false,
      total: 0,
      error: error.message
    };
  }
}

/**
 * OPEN - Open capsule with code and location validation
 * This function decrypts the message and saves it back to the database
 *
 * @param identifier - Document ID, user_id, or user_email
 * @param identifierType - Type of identifier: "id" | "user_id" | "user_email"
 * @param code - Unlock code
 * @param currentFootprint - Current user location (optional, required if capsule has footprint)
 */
export async function openCapsule(
  identifier: string,
  identifierType: "id" | "user_id" | "user_email" = "id",
  code: string,
  currentFootprint?: Footprint
) {
  try {
    const capsuleResult = await getCapsule(identifier, identifierType);

    if (!capsuleResult.success || !capsuleResult.capsule) {
      return { success: false, message: "Capsule not found" };
    }

    const capsule = capsuleResult.capsule;

    if (capsule.is_opened) {
      return {
        success: true,
        message: "Capsule already opened",
        capsule: capsule
      };
    }

    const now = new Date();
    const lockedUntil = new Date(capsule.locked_until);
    if (now < lockedUntil) {
      return {
        success: false,
        message: "Capsule is still locked",
        lockedUntil: capsule.locked_until
      };
    }

    const isValidCode = await verifyCode(code, capsule.code);
    if (!isValidCode) {
      return { success: false, message: "Invalid code" };
    }

    if (capsule.footprint && currentFootprint) {
      try {
        const savedFootprint: Footprint = JSON.parse(capsule.footprint);
        const isValid = isLocationValid(currentFootprint, savedFootprint, 100);

        if (!isValid) {
          const distance = calculateDistance(
            currentFootprint.latitude,
            currentFootprint.longitude,
            savedFootprint.latitude,
            savedFootprint.longitude
          );

          return {
            success: false,
            message:
              "You must be at the designated location to open this capsule",
            requiresLocation: true,
            distance: Math.round(distance),
            savedLocation: {
              latitude: savedFootprint.latitude,
              longitude: savedFootprint.longitude
            }
          };
        }
      } catch (parseError) {
        console.error("Failed to parse footprint:", parseError);
      }
    } else if (capsule.footprint && !currentFootprint) {
      return {
        success: false,
        message: "This capsule requires location verification",
        requiresLocation: true
      };
    }

    const decryptedMessage = decryptMessage(capsule.message, code);

    const updatedCapsule = await databases.updateDocument(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      capsule.$id,
      {
        is_opened: true,
        message: decryptedMessage
      }
    );

    return {
      success: true,
      capsule: {
        ...updatedCapsule,
        message: decryptedMessage
      }
    };
  } catch (error: any) {
    console.error("Open capsule error:", error);
    return {
      success: false,
      message: error.message || "Failed to open capsule"
    };
  }
}

/**
 * UPDATE - Update capsule
 */
export async function updateCapsule(
  documentId: string,
  data: Partial<Capsule>
) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      documentId,
      data
    );

    return {
      success: true,
      capsule: response as unknown as Capsule
    };
  } catch (error: any) {
    console.error("Update capsule error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * DELETE - Delete capsule
 */
export async function deleteCapsule(documentId: string, fileId?: string) {
  try {
    if (fileId) {
      try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
      } catch (error) {
        console.error("Failed to delete attachment:", error);
      }
    }

    await databases.deleteDocument(
      DATABASE_ID,
      CAPSULE_COLLECTION_ID,
      documentId
    );

    return { success: true };
  } catch (error: any) {
    console.error("Delete capsule error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
