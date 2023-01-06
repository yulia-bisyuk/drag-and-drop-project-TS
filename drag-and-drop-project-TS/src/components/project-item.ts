import { Component } from './base-component.js';
import { Draggable } from '../models/drag-drop.js';
import { Project } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }
  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }
  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }
  dragEndHandler(_: DragEvent): void {}

  configure() {
    this.elem.addEventListener('dragstart', this.dragStartHandler);
    this.elem.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent() {
    this.elem.querySelector('h2')!.textContent = this.project.title;
    this.elem.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.elem.querySelector('p')!.textContent = this.project.description;
  }
}
