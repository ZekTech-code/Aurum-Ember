import { useEffect } from 'react';
import ReserveTable from '../components/ReserveTable';
import PageLayout from '../components/PageLayout';

export default function ReservePage() {
  // Scroll to top when this page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PageLayout>
      <ReserveTable />
    </PageLayout>
  );
}
