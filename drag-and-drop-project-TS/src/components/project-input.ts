import { Component } from './base-component.js';
import { Validatable, validate } from '../utils/validation.js';
import { Autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
