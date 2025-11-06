import { Diagram } from './diagram';
import { Node } from './types';

export class Progress {
	constructor(
		private targetElement: HTMLElement,
		private clearButton: HTMLButtonElement,
		private progressElement: HTMLElement,
		private diagram: Diagram,
	) {
		this.clearButton.addEventListener('click', () => {
			this.diagram.clearSelected();
		});

		this.diagram.addEventListener('selectionChanged', () => {
			this.update();
		});

		this.update();
	}

	private update(): void {
		this.targetElement.textContent = '';
		this.progressElement.textContent = '';

		const selectedNode = this.diagram.findNode((node: Node) => node.selected);
		if (!selectedNode) {
			this.clearButton.style.display = 'none';
			return;
		}

		this.clearButton.style.display = 'inline-block';
		this.targetElement.textContent = selectedNode.name;
		this.diagram.getAncestors(selectedNode).forEach(ancestor => {
			const itemElement = document.createElement('div');
			let status: string;
			if (ancestor.completed) {
				status = '✅';
			} else if (ancestor.required) {
				status = '❌';
			} else {
				status = '🎯';
			}
			itemElement.textContent = `${status} ${ancestor.name}`;
			this.progressElement.appendChild(itemElement);
		});
	}
}
