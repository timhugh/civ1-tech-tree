import { type Node } from './graph';
import { Graph } from './graph';

var instance: Search | null = null;

export const useSearch = (
	searchInput: HTMLInputElement,
	searchResultsContainer: HTMLElement,
	graph: Graph,
): Search => {
	if (!instance) {
		instance = new Search(searchInput, searchResultsContainer, graph);
	}
	return instance;
}

class Search {
	searchResults: Node[] = [];

	constructor(
		private searchInput: HTMLInputElement,
		private searchResultsContainer: HTMLElement,
		private graph: Graph,
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
		this.graph.getNodes().forEach((node: Node) => {
			const name = node.data.name.toLowerCase();
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
				this.graph.focus(node);
			});
			this.searchResultsContainer.appendChild(resultItem);
		});
	}
};
