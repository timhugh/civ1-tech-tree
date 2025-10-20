import { type Node } from './graph';
import * as graph from './graph';

var instance: Search | null = null;

export const useSearch = (
	searchInput: HTMLInputElement, 
	searchResultsContainer: HTMLElement
): Search => {
	if (!instance) {
		instance = new Search(searchInput, searchResultsContainer);
	}
	return instance;
}

export const search = (query: string): void => {
	if (instance) {
		instance.search(query);
	} else {
		console.error('Search instance not initialized. Did you forget to call useSearch()?');
	}
};

class Search {
	searchResults: Node[] = [];

	constructor(
		private searchInput: HTMLInputElement,
		private searchResultsContainer: HTMLElement,
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
				graph.focus(firstResult);
			}
		});
	}

	search(query: string): void {
		if (query === '') {
			return;
		}

		this.searchResults.length = 0;
		graph.getNodes().forEach((node: Node) => {
			const name = node.data('name').toLowerCase();
			if(name.includes(query)) {
				this.searchResults.push(node);
			}
		});
		this.render();
	}

	private render(): void {
		this.searchResultsContainer.innerHTML = '';
		this.searchResults.forEach(node => {
			const resultItem = document.createElement('div');
			resultItem.textContent = node.data.name;
			resultItem.addEventListener('click', () => {
				graph.focus(node);
			});
			this.searchResultsContainer.appendChild(resultItem);
		});
	}
};
