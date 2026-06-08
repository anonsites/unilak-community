import { Database } from './database.types';

export type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
  reactions_count: Record<string, number> | null;
  view_count: number | null;
};

export type ClassStatus = 'active' | 'inactive' | 'completed';

export type UniversityClass = {
  faculty: string;
  id: string;
  course_name: string;
  department: string;
  year_of_study: string;
  program: string;
  intake: string;
  lecturer: string | null;
  start_date: string | null;
  end_date: string | null;
  cat_date: string | null;
  exam_date: string | null;
  classroom: string | null;
  whatsapp_link: string | null;
  cp_contact: string | null;
  created_at: string;
  updated_at: string;
};

export type ClassFilterOptions = {
  [key: string]: string[];
};
