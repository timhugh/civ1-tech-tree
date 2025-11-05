import { GraphData, NodeData } from './types';
import * as go from 'gojs';

export interface Node {
	id: string;
	data: NodeData;
	completed: boolean;
	highlighted: boolean;

	parents: NodeCollection;
	children: NodeCollection;
	group: NodeCollection;
};
export interface NodeCollection extends Array<Node> { };

var instance: Graph | null = null;

export const useGraph = (
	container: HTMLElement,
	graphData: GraphData,
): Graph => {
	if (!instance) {
		instance = new Graph(container, graphData);
	}
	return instance;
};

export class Graph {
	private nodes: NodeCollection = [];
	private selectedNodeId?: string;

	constructor(
		private container: HTMLElement,
		private graphData: GraphData,
	) {
	}

	getNodes(): NodeCollection {
		return this.nodes;
	}

	focus(node: Node): void {
		this.selectedNodeId = node.id;
	}

	clearCompleted(): void {
		this.nodes.forEach((node) => {
			node.completed = false;
		});
	}
}
