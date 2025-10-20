import { useGraph } from './graph';
import { useSearch } from './search';
import graphData from './graph-data';

window.onload = () => {
	const graphContainer = document.getElementById('graph') as HTMLElement;
	const graph = useGraph(graphContainer, graphData);
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	const searchResultsContainer = document.getElementById('search-results') as HTMLElement;
	useSearch(searchInput, searchResultsContainer);

	const resetButton = document.getElementById('reset-button');
	if (resetButton) {
		resetButton.addEventListener('click', () => {
			if (confirm('Are you sure you want to reset all completed technologies?')) {
				graph.clearCompleted();
			}
		});
	}
}
