"use client";

import { useDashboard } from '@/hooks/useDashboard';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import ProjectTabsNav from '@/app/components/ProjectTabsNav';

interface ProjectDetailLayoutProps {
  children: React.ReactNode;
}

export default function ProjectDetailLayout({ children }: ProjectDetailLayoutProps) {
  const { setActiveProjectId } = useDashboard();
  const params = useParams();
  const projectId = params.projectId as string;

  // This effect synchronizes the URL with our global context
  useEffect(() => {
    if (projectId) {
      // Tell the context that we are now inside a project
      setActiveProjectId(projectId);
    }
  }, [projectId, setActiveProjectId]);

  return (
    <>
      <ProjectTabsNav projectId={projectId} />
      <div className="project-content-wrapper">
        {children}
      </div>
      <style jsx>{`
        .project-content-wrapper {
          @media (max-width: 768px) {
            padding-top: 3rem;
          }
        }
      `}</style>
    </>
  );
}
