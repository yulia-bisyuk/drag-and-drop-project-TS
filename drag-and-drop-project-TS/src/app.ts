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
      isValid && validatableInput.value.length > validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length < validatableInput.maxLength;
  }
  if (
    validatableInput.minValue != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value > validatableInput.minValue;
  }
  if (
    validatableInput.maxValue != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value < validatableInput.maxValue;
  }
  return isValid;
}

//ProjectInput class
class ProjectInput {
  templateElem: HTMLTemplateElement;
  hostElem: HTMLDivElement;
  elem: HTMLFormElement;
  titleInputElem: HTMLInputElement;
  descriptionInputElem: HTMLInputElement;
  peopleInputElem: HTMLInputElement;

  constructor() {
    this.templateElem = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElem = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElem.content, true);

    this.elem = importedNode.firstElementChild as HTMLFormElement;
    this.elem.id = 'user-input';
    this.titleInputElem = this.elem.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElem = this.elem.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElem = this.elem.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.attach();
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
      console.log(title, descr, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.elem.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElem.insertAdjacentElement('afterbegin', this.elem);
  }
}

const projInp = new ProjectInput();
