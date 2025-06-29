export interface Client {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone?: string;
  businessType: string;
  website?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  lastPostDate?: string;
  nextScheduledPost?: string;
  status: 'up-to-date' | 'overdue' | 'pending';
}

export interface PlannerPost {
  id: string;
  clientId: string;
  date: string;
  dayOfWeek: string;
  postType: 'info' | 'product' | 'promo' | 'testimonial' | 'seasonal' | 'other';
  title: string;
  notes?: string;
  captionText?: string;
  status: 'drafted' | 'awaiting-approval' | 'approved' | 'posted';
  createdAt: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  title: string;
  caption: string;
  image?: string;
  tags: string[];
  status: 'idea' | 'ready' | 'pending' | 'used';
  createdBy?: string;
  assignedToPostId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  clientId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  createdAt: string;
}

export interface AppState {
  user: User | null;
  clients: Client[];
  plannerPosts: PlannerPost[];
  contentItems: ContentItem[];
  tasks: Task[];
}