export type IssueCategory = 'potholes' | 'graffiti' | 'streetlights';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  lat: number;
  lng: number;
  image?: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  votes: number;
  date: string;
  ward: string;
  userEmail?: string;
  votedByUser?: boolean;
}

export interface User {
  email: string;
  name: string;
  ward: string;
}

export interface WardStat {
  name: string;
  solved: number;
  total: number;
}
