import { redirect } from 'next/navigation';

export default function AnnouncementRedirectPage() {
  redirect('/announcements/manage');
}
