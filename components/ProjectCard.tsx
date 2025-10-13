'use client'

import { Project } from '@/lib/content'
import Link from 'next/link'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const isInternalLink = (url: string) => {
    return url.startsWith('/')
  }

  return (
    <div className="project-card">
      <div className="project-image">
        <i className={project.icon || 'fas fa-code'} />
      </div>
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        {project.tags && (
          <div className="project-tags">
            {project.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="project-links">
          {project.demoUrl && (
            isInternalLink(project.demoUrl) ? (
              <Link href={project.demoUrl} className="project-link">
                <i className="fas fa-external-link-alt" />
                演示
              </Link>
            ) : (
              <a
                href={project.demoUrl}
                className="project-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-external-link-alt" />
                演示
              </a>
            )
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github" />
              代码
            </a>
          )}
        </div>
      </div>
    </div>
  )
}