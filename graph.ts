import cytoscape  from 'cytoscape';
import klay from 'cytoscape-klay';
import { GraphData, NodeData } from './types';

// wrapping cytoscape types
export interface NodeDefinition extends cytoscape.ElementDefinition {};
export interface Node extends cytoscape.NodeSingular {};
export interface NodeCollection extends cytoscape.NodeCollection {};

const buildCy = (container: HTMLElement, graphData: GraphData): cytoscape.Core => {
	cytoscape.use(klay);
	const cy = cytoscape({
		container: container,
		elements: buildElements(graphData),
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

	cy.on('mouseover', 'node', function(evt){
		highlightDependencies(evt.target);
	});

	cy.on('mouseout', 'node', function(_evt){
		clearHighlights();
	});

	cy.on('click', 'node', function(evt){
		toggleComplete(evt.target);
	});

	restoreCompleted();

	return cy;
}

const buildId = ({ name, type }: { name: string, type: string }): string => {
	return `${type}::${name.replace(/\s+/g, '_').toLowerCase()}`;
};

interface NodeWithOptionalParent extends NodeData {
	parentId?: string;
};

const buildNode = ({ name, type, prereqs, unlocks, parentId }: NodeWithOptionalParent): NodeDefinition[] => {
	const elements: NodeDefinition[] = [];

	const node: NodeDefinition = {
		group: 'nodes',
		data: { id: buildId({ name, type }), name: name },
		classes: type,
	};
	if (parentId) {
		node.data['parent'] = parentId;
	}
	elements.push(node);

	if (prereqs) {
		prereqs.forEach(prereq => {
			elements.push({
				group: 'edges',
				data: { source: prereq, target: node.data.id }
			});
		});
	}

	if (unlocks) {
		node.classes += ' has-unlocks';
		unlocks.forEach(unlock => buildNode({ name: unlock.name, type: unlock.type, parentId: node.data.id }));
	}

	return elements;
};

const buildElements = (data: GraphData): NodeDefinition[] => {
	const elements: NodeDefinition[] = [];
	data.nodes.forEach(node => {
		const nodes = buildNode(node);
		elements.push(...nodes);
	});
	return elements;
};


const highlightDependencies = (target: Node) => {
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

const toggleComplete = (target: Node) => {
	const node = target.isChild() ? target.parent() : target;
	node.toggleClass('completed');
	persistCompleted();
};

const persistCompleted = () => {
	localStorage.setItem('completedTechnologies', JSON.stringify(
		cy?.nodes('.completed').map(node => node.id())
	));
};

const restoreCompleted = () => {
	const completedTechnologies = JSON.parse(localStorage.getItem('completedTechnologies') || '[]');
	completedTechnologies.forEach((techId: string) => {
		const node = cy?.getElementById(techId);
		if (node) {
			node.addClass('completed');
		}
	});
};

export const clearCompleted = () => {
	cy!.elements().removeClass('completed');
	persistCompleted();
};

const clearHighlights = () => {
	cy!.elements().removeClass('required');
	cy!.elements().removeClass('unlocked');
};

export const focus = (node: Node) => {
	cy!.zoom(1);
	cy!.center(node);
}

export const getNodes = (): NodeCollection => {
	return cy!.nodes();
};

interface Graph {
	focus: (node: Node) => void;
	getNodes: () => NodeCollection;
	clearCompleted: () => void;
}

var cy: cytoscape.Core | null = null;

export const useGraph = (
	container: HTMLElement,
	graphData: GraphData,
): Graph => {
	if (!cy) {
		cy = buildCy(container, graphData);
	}
	return {
		focus,
		getNodes,
		clearCompleted,
	};
};
