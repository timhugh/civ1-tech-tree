import { GraphData } from './types';
import { Graph } from './graph';

var instance: Diagram | null = null;

export const useDiagram = (
	container: HTMLElement,
	graphData: GraphData,
): Diagram => {
	if (!instance) {
		instance = new Diagram(container, graphData);
	}
	return instance;
};

export class Diagram {
	constructor(
		private container: HTMLElement,
		private graphData: GraphData,
	) {
	}

	focus(node: Node): void {
	}

	clearCompleted(): void {
	}
}
