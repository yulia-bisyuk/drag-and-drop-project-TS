// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
} // for ProjectItem class

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
} // for ProjectList class

//Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//Project state management
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((proj) => proj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.minValue != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.minValue;
  }
  if (
    validatableInput.maxValue != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.maxValue;
  }
  return isValid;
}

// Component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElem: HTMLTemplateElement;
  hostElem: T;
  elem: U;

  constructor(
    templateId: string,
    hostId: string,
    insertAtStart: boolean,
    newElemId?: string
  ) {
    this.templateElem = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElem = document.getElementById(hostId)! as T;

    const importedNode = document.importNode(this.templateElem.content, true);

    this.elem = importedNode.firstElementChild as U;
    if (newElemId) {
      this.elem.id = newElemId;
    }
    this.attach(insertAtStart);
  }

  private attach(insertAtStartPosition: boolean) {
    this.hostElem.insertAdjacentElement(
      insertAtStartPosition ? 'afterbegin' : 'beforeend',
      this.elem
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem class
class ProjectItem
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
  dragEndHandler(_: DragEvent): void {
    console.log('Drag End');
  }

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

//ProjectList class
class ProjectList
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
  dragLeaveHandler(event: DragEvent) {
    const listEl = this.elem.querySelector('ul')!;
    listEl.classList.remove('droppable');
    console.log(event);
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

//ProjectInput class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElem: HTMLInputElement;
  descriptionInputElem: HTMLInputElement;
  peopleInputElem: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.titleInputElem = this.elem.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElem = this.elem.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElem = this.elem.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.elem.addEventListener('submit', this.submitHandler);
  }

  private getInputValues(): [string, string, number] | void {
    const titleInput = this.titleInputElem.value;
    const descriptionInput = this.descriptionInputElem.value;
    const peopleInput = this.peopleInputElem.value;

    const titleValidatable: Validatable = {
      value: titleInput,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: descriptionInput,
      required: true,
      minLength: 6,
      maxLength: 50,
    };

    const peopleValidatable: Validatable = {
      value: +peopleInput,
      required: true,
      minValue: 1,
      maxValue: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, try again');
      return;
    } else {
      return [titleInput, descriptionInput, +peopleInput];
    }
  }

  private clearInputs() {
    this.titleInputElem.value = '';
    this.descriptionInputElem.value = '';
    this.peopleInputElem.value = '';
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getInputValues();
    if (Array.isArray(userInput)) {
      const [title, descr, people] = userInput;
      projectState.addProject(title, descr, people);
      this.clearInputs();
    }
  }

  renderContent() {}
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
