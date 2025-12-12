export interface CapsuleProps {
  // id: string; // Auto
  user_id: string; // Get from Appwrite Auth (Session Magic Link)
  user_email: string; // Get from Appwrite Auth (Session Magic Link)
  footprint: string; // Auto using footprint.js
  name: string; // Auto or Manual Setting
  code: number; // 6 Pin of number
  attachment: string; // Media URL (Store in bucket) *only select one between image, audio & video. And size only 5mb
  message: string; // 500 Characters or more maybe
  locked_until: string; // Up to 3 years
  coordinate: {
    lat: number
    lang: number
  }
}
