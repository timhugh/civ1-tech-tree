import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import elk from 'cytoscape-elk';
import fcose from 'cytoscape-fcose';
import klay from 'cytoscape-klay';
import { techTree } from './graph-data.js';

cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(elk);
cytoscape.use(fcose);
cytoscape.use(klay);

const elements = [];

techTree.forEach(tech => {
	const { id, name, prereqs, unlocks } = tech;
	const techNode = {
		group: 'nodes',
		data: { id: id , name: name },
		classes: ['technology']
	};
	if(prereqs) {
		prereqs.forEach(prereqId => {
			elements.push({
				group: 'edges',
				data: { source: prereqId, target: id }
			});
		});
	}
	if(unlocks) {
		techNode.classes.push('has-unlocks');
		unlocks.forEach(unlock => {
			const unlockNode = {
				group: 'nodes',
				data: { id: unlock.id, name: unlock.name, parent: id },
				classes: [unlock.type],
			};
			elements.push(unlockNode);
		});
	}

	elements.push(techNode);
});


const cy = cytoscape({
	container: document.getElementById('cy'),
	elements: elements,
	style: [
		{
			selector: 'node',
			style: {
				'label': 'data(name)',
				'width': 'label',
				'height': 'label',
				'padding': '20px',
				'shape': 'round-rectangle',
				'text-valign': 'center',
				'text-halign': 'center',
				'background-color': '#ccc',
				'border-width': 2,
				'border-color': '#333'
			}
		},
		{
			'selector': 'node.has-unlocks',
			style: {
				'text-valign': 'top',
			}
		},
		{
			selector: 'edge',
			style: {
				'width': 2,
				'line-color': '#999',
				'target-arrow-color': '#999',
				'target-arrow-shape': 'triangle',
				'curve-style': 'taxi',
			}
		},
		{
			selector: '.technology',
			style: { 'background-color': '#9c9' }
		},
		{
			selector: '.building',
			style: { 'background-color': '#ccc' }
		},
		{
			selector: '.wonder',
			style: { 'background-color': '#cc9' }
		},
		{
			selector: '.unit',
			style: { 'background-color': '#99c' }
		},
		{
			selector: '.spaceshippart',
			style: { 'background-color': '#c99' }
		},
		{
			selector: '.completed',
			style: {
				'background-color': '#666',
			}
		},
		{
			selector: '.required',
			style: {
				'background-color': '#f88',
			}
		},
		{
			selector: '.completed.required',
			style: {
				'background-color': '#8f8',
			}
		},
		{
			selector: '.unlocked',
			style: {
				'background-color': '#8f8',
			}
		},
	],
	layout: {
		name: 'klay',
		klay: {
			direction: 'RIGHT',
			compactComponents: true,
			nodePlacement: 'SIMPLE',
			edgeRouting: 'POLYLINE',
		},
	},
	minZoom: 0.1,
	maxZoom: 2,
	autoungrabify: true,
});

const highlightDependencies = (target) => {
	clearHighlights();
	const node = target.isChild() ? target.parent() : target;

	const incompletePredecessors = [];
	node.predecessors('node').forEach(predecessor => {
		predecessor.addClass('required');
		if (!predecessor.hasClass('completed')) {
			incompletePredecessors.push(predecessor);
		}
	});

	if (incompletePredecessors.length > 0) {
		node.addClass('required');
	} else {
		node.addClass('unlocked');
	}
};

const persistCompleted = () => {
	localStorage.setItem('completedTechnologies', JSON.stringify(
		cy.nodes('.completed').map(node => node.id())
	));
};

const restoreCompleted = () => {
	const completedTechnologies = JSON.parse(localStorage.getItem('completedTechnologies') || '[]');
	completedTechnologies.forEach(techId => {
		const node = cy.getElementById(techId);
		if (node) {
			node.addClass('completed');
		}
	});
};

const toggleComplete = (target) => {
	const node = target.isChild() ? target.parent() : target;
	node.toggleClass('completed');
	persistCompleted();
};

const clearCompleted = () => {
	cy.elements().removeClass('completed');
};

const clearHighlights = () => {
	cy.elements().removeClass('required');
	cy.elements().removeClass('unlocked');
};

const centerNode = (node) => {
	cy.zoom(1);
	cy.center(node);
}

cy.on('mouseover', 'node', function(evt){
	highlightDependencies(evt.target);
});

cy.on('mouseout', 'node', function(_evt){
	clearHighlights();
});

cy.on('click', 'node', function(evt){
	toggleComplete(evt.target);
});

window.onload = () => {
	const searchInput = document.getElementById('search-input');
	const searchResultsContainer = document.getElementById('search-results');
	const searchResults = [];

	const renderSearchResults = () => {
		searchResultsContainer.innerHTML = '';
		searchResults.forEach(node => {
			const resultItem = document.createElement('div');
			resultItem.textContent = node.data('name');
			resultItem.addEventListener('click', () => {
				centerNode(node);
				highlightDependencies(node);
			});
			searchResultsContainer.appendChild(resultItem);
		});
	};

	const doSearch = () => {
		const query = searchInput.value.toLowerCase();
		if (query === '') {
			return;
		}

		searchResults.length = 0;
		cy.nodes().forEach(node => {
			const name = node.data('name').toLowerCase();
			if(name.includes(query)) {
				searchResults.push(node);
			}
		});
		renderSearchResults();
	}

	searchInput.addEventListener('input', () => {
		doSearch();
	});

	searchInput.addEventListener('focus', () => {
		doSearch();
	});

	searchInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter' && searchResults.length > 0) {
			const firstResult = searchResults[0];
			centerNode(firstResult);
			highlightDependencies(firstResult);
		}
	});

	const resetButton = document.getElementById('reset-button');
	resetButton.addEventListener('click', () => {
		if (confirm('Are you sure you want to reset all completed technologies?')) {
			clearCompleted();
		}
	});

	restoreCompleted();
}
