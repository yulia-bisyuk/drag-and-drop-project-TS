import { Component } from './base-component.js';
import { Project, ProjectStatus } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';
import { DragTarget } from '../models/drag-drop.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.elem.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }
  @Autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.elem.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure() {
    this.elem.addEventListener('dragover', this.dragOverHandler);
    this.elem.addEventListener('dragleave', this.dragLeaveHandler);
    this.elem.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    this.elem.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    const listId = `${this.type}-projects-list`;
    this.elem.querySelector('ul')!.id = listId;
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.elem.querySelector('ul')!.id, prjItem);
    }
  }
}
