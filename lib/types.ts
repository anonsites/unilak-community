import { Database } from './database.types';

export type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string | null; avatar_url: string | null } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
};