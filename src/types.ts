export interface Track {
  title: string;
  version: string; // e.g. "Original Mix", "Radio Edit"
  singer: string;
  featuring: string;
  composer: string;
  lyricist: string;
  producer: string;
  publisher: string;
  copyrightHolder: string;
  lyrics: string;
  audioFileName: string;
  audioSize: string;
}

export type ReleaseStatus = 'draft' | 'scheduled' | 'approved' | 'rejected';

export interface Release {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  coverUrl: string;
  tracks: Track[];
  genre: string;
  subGenre: string;
  language: string;
  mood: string;
  stores: string[]; // e.g. ['spotify', 'apple', 'jiosaavn']
  status: ReleaseStatus;
  releaseDate: string;
  upc?: string;
  isrc?: string;
  feedback?: string; // admin rejection feedback
  createdAt: string;
}

export interface SupportTicketReply {
  sender: 'artist' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  artistId: string;
  artistName: string;
  subject: string;
  category: string; // e.g. "distribution", "royalties", "technical"
  message: string;
  status: 'open' | 'resolved';
  replies: SupportTicketReply[];
  createdAt: string;
}

export interface RoyaltyReport {
  id: string;
  month: string; // e.g. "2026-06"
  totalStreams: number;
  totalRevenue: number; // in INR
  storeBreakdown: { store: string; streams: number; revenue: number }[];
  countryBreakdown: { country: string; streams: number; revenue: number }[];
  status: 'paid' | 'pending';
}

export interface WithdrawalRequest {
  id: string;
  artistId: string;
  artistName: string;
  amount: number;
  paymentMethod: string; // e.g. "Bank Transfer", "UPI"
  details: string; // account details / UPI ID
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  date: string;
  tags: string[];
  comments: { author: string; text: string; date: string }[];
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'admin';
  labelName?: string;
  isVerified?: boolean;
}
