import { Diagram } from './diagram';
import { Node } from './types';

export class Search {
	searchResults: Node[] = [];

	constructor(
		private searchInput: HTMLInputElement,
		private clearButton: HTMLButtonElement,
		private searchResultsContainer: HTMLElement,
		private diagram: Diagram,
	) {
		searchInput.addEventListener('input', () => {
			const query = this.searchInput.value.toLowerCase();
			this.search(query);
		});

		searchInput.addEventListener('focus', () => {
			const query = this.searchInput.value.toLowerCase();
			this.search(query);
		});

		searchInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && this.searchResults.length > 0) {
				const firstResult = this.searchResults[0];
				diagram.focusNode(firstResult);
			}
		});

		clearButton.addEventListener('click', () => {
			this.searchInput.value = '';
			this.searchResults.length = 0;
			this.render();
			diagram.unfocus();
		});
	}

	search(query: string): void {
		if (query === '') {
			return;
		}

		this.searchResults.length = 0;
		const results = this.diagram.filterNodes((node: Node) => {
			const name = node.name.toLowerCase();
			return name.includes(query);
		});
		this.searchResults.push(...results);
		this.render();
	}

	private render(): void {
		this.searchResultsContainer.innerHTML = '';
		this.searchResults.forEach(node => {
			const resultItem = document.createElement('div');
			resultItem.textContent = node.name;
			resultItem.addEventListener('click', () => {
				this.diagram.focusNode(node);
			});
			this.searchResultsContainer.appendChild(resultItem);
		});
	}
};
