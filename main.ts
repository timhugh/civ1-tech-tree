import { Diagram } from './diagram';
import { Search } from './search';
import graphData from './graph-data';

window.onload = () => {
	const graphContainer = document.getElementById('diagram') as HTMLElement;
	const diagram = new Diagram(graphContainer, graphData);
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	const searchClearButton = document.getElementById('search-clear') as HTMLButtonElement;
	const searchResultsContainer = document.getElementById('search-results') as HTMLElement;
	const search = new Search(searchInput, searchClearButton, searchResultsContainer, diagram);

	const resetButton = document.getElementById('reset-button');
	if (resetButton) {
		resetButton.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all completed technologies?')) {
				diagram.clearCompleted();
			}
		});
	}
}
