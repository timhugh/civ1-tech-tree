import { Diagram } from './diagram';
import { Search } from './search';
import { Progress } from './progress';
import graphData from './graph-data';

window.onload = () => {
	const graphContainer = document.getElementById('diagram') as HTMLElement;
	const diagram = new Diagram(graphContainer, graphData);

	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	const searchClearButton = document.getElementById('search-clear') as HTMLButtonElement;
	const searchResultsContainer = document.getElementById('search-results') as HTMLElement;
	const search = new Search(searchInput, searchClearButton, searchResultsContainer, diagram);

	const currentTarget = document.getElementById('current-target') as HTMLElement;
	const targetProgress = document.getElementById('target-progress') as HTMLElement;
	const clearSelectionButton = document.getElementById('clear-target-button') as HTMLButtonElement;
	const progress = new Progress(currentTarget, clearSelectionButton, targetProgress, diagram);

	const resetButton = document.getElementById('reset-button');
	if (resetButton) {
		resetButton.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all completed technologies?')) {
				diagram.clearCompleted();
			}
		});
	}
}
