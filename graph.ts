import { GraphData, NodeData, NodeId, Node } from './types';

export interface GraphNode extends Node {
	parents: Array<NodeId>;
	children: Array<NodeId>;
	group: Array<NodeId>;
}

export interface GraphNodeMap {
	[id: string]: GraphNode;
}

export class Graph {
	private nodes: GraphNodeMap = {};

	constructor(private graphData: GraphData) {
		this.build();
	}

	get(node: NodeId): GraphNode | undefined {
		return this.nodes[node];
	}

	require(node: NodeId): GraphNode {
		const found = this.get(node);
		if (!found) throw new Error(`Node with id ${node} does not exist in the graph.`);
		return found;
	}

	getAll(): Array<GraphNode> {
		return Object.values(this.nodes);
	}

	parents(start: NodeId): Array<GraphNode> {
		const node = this.require(start);
		return node.parents.map(parentId => this.get(parentId) as GraphNode);
	}

	children(start: NodeId): Array<GraphNode> {
		const node = this.require(start);
		return node.children.map(childId => this.get(childId) as GraphNode);
	}

	ancestors(startId: NodeId): Array<GraphNode> {
		const ancestors: GraphNode[] = [];
		this.traverse(startId, 'up', (node: GraphNode) => {
			if (node.id !== startId) {
				ancestors.push(node);
			}
		});
		return ancestors;
	}

	descendants(startId: NodeId): Array<GraphNode> {
		const descendants: GraphNode[] = [];
		this.traverse(startId, 'down', (node: GraphNode) => {
			if (node.id !== startId) {
				descendants.push(node);
			}
		});
		return descendants;
	}

	traverse(startId: NodeId, direction: 'up' | 'down', visit: (node: GraphNode) => void): void {
		this.require(startId);

		const getNextIds = direction === 'up'
			? (node: GraphNode) => node.parents
			: (node: GraphNode) => [...node.children, ...node.group];

		const visited = new Set<NodeId>();
		const stack: Array<NodeId> = [startId];

		while (stack.length > 0) {
			const id = stack.pop()!;
			if (visited.has(id)) continue;
			visited.add(id);

			const node = this.get(id);
			if (node) {
				visit(node);
				stack.push(...getNextIds(node));
			}
		}
	}

	private build(): void {
		this.graphData.nodes.forEach((data: NodeData) => {
			const node = this.buildAndMergeNode(data);

			data.prereqs?.forEach((prereqData: NodeData) => {
				const prereqNode = this.buildAndMergeNode(prereqData);
				node.parents.push(prereqNode.id);
				prereqNode.children.push(node.id);
				this.nodes[prereqNode.id] = prereqNode;
			});

			data.unlocks?.forEach((unlockData: NodeData) => {
				const unlockNode = this.buildAndMergeNode(unlockData);
				node.group.push(unlockNode.id);
				unlockNode.parents.push(node.id);
				this.nodes[unlockNode.id] = unlockNode;
			});

			this.nodes[node.id] = node;
		});
		this.validate();
	}

	private validate(): void {
		const visited = new Set<NodeId>();
		const stack = new Set<NodeId>();
		const errors: string[] = [];

		const visit = (node: GraphNode) => {
			if (visited.has(node.id)) return;
			stack.add(node.id);
			visited.add(node.id);

			[...node.children, ...node.group].forEach(childId => {
				const childNode = this.get(childId);
				if (childNode) {
					if (stack.has(childNode.id)) {
						errors.push(`Cycle detected: invalid dependency from ${childNode.type} ${childNode.name} to ${node.type} ${node.name}`);
						return;
					}
					visit(childNode);
				}
			});

			stack.delete(node.id);
		};

		Object.values(this.nodes).forEach(node => {
			visit(node);
		});

		if (errors.length > 0) {
			throw new Error(errors.join('; '));
		}
	}

	private buildAndMergeNode(data: NodeData): GraphNode {
		return Object.assign(this.nodes[this.buildNodeId(data)] || {
			parents: [],
			children: [],
			group: [],
		}, {
			id: this.buildNodeId(data),
			name: data.name,
			type: data.type,
			completed: false,
			highlighted: false,
		});
	}

	private buildNodeId(data: NodeData): string {
		return `${data.type}-${data.name}`.toLowerCase().replace(/\s+/g, '-');
	}
}
