export interface Footprint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface Attachment {
  fileId: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url: string;
}

export interface Capsule {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  user_email: string;
  name: string;
  message: string;
  code: string;
  locked_until: string;
  footprint: string | null;
  attachment: string | null;
  is_opened: boolean;
}