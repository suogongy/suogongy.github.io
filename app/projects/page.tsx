import { getProjects } from '@/lib/content'
import ProjectCard from '@/components/ProjectCard'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <section className="section">
      <h2 className="section-title">项目展示</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  )
}