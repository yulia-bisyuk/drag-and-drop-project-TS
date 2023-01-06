export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
