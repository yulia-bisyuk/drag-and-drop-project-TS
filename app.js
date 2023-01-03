"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstanse() {
        if (this.instance)
            return this.instance;
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstanse();
function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.minValue != null &&
        typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.minValue;
    }
    if (validatableInput.maxValue != null &&
        typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.maxValue;
    }
    return isValid;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElem = document.getElementById('project-list');
        this.hostElem = document.getElementById('app');
        const importedNode = document.importNode(this.templateElem.content, true);
        this.elem = importedNode.firstElementChild;
        this.elem.id = `${this.type}-projects`;
        this.assignedProjects = [];
        projectState.addListener((projects) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
    attach() {
        this.hostElem.insertAdjacentElement('beforeend', this.elem);
    }
    renderContent() {
        this.elem.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
        const listId = `${this.type}-projects-list`;
        this.elem.querySelector('ul').id = listId;
    }
}
class ProjectInput {
    constructor() {
        this.templateElem = document.getElementById('project-input');
        this.hostElem = document.getElementById('app');
        const importedNode = document.importNode(this.templateElem.content, true);
        this.elem = importedNode.firstElementChild;
        this.elem.id = 'user-input';
        this.titleInputElem = this.elem.querySelector('#title');
        this.descriptionInputElem = this.elem.querySelector('#description');
        this.peopleInputElem = this.elem.querySelector('#people');
        this.configure();
        this.attach();
    }
    getInputValues() {
        const titleInput = this.titleInputElem.value;
        const descriptionInput = this.descriptionInputElem.value;
        const peopleInput = this.peopleInputElem.value;
        const titleValidatable = {
            value: titleInput,
            required: true,
        };
        const descriptionValidatable = {
            value: descriptionInput,
            required: true,
            minLength: 6,
            maxLength: 50,
        };
        const peopleValidatable = {
            value: +peopleInput,
            required: true,
            minValue: 1,
            maxValue: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid input, try again');
            return;
        }
        else {
            return [titleInput, descriptionInput, +peopleInput];
        }
    }
    clearInputs() {
        this.titleInputElem.value = '';
        this.descriptionInputElem.value = '';
        this.peopleInputElem.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.getInputValues();
        if (Array.isArray(userInput)) {
            const [title, descr, people] = userInput;
            projectState.addProject(title, descr, people);
            this.clearInputs();
        }
    }
    configure() {
        this.elem.addEventListener('submit', this.submitHandler);
    }
    attach() {
        this.hostElem.insertAdjacentElement('afterbegin', this.elem);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
//# sourceMappingURL=app.js.map