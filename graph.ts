import { GraphData, NodeData, NodeId, Node, NodeMap as Graph } from './types';

export function generateNodeId(nodeData: NodeData): NodeId {
	return `${nodeData.type}_${nodeData.name}`
		.toLowerCase()
		.replace(/[^a-z]/gi, '_');
}

export function traverseAncestors(node: Node): Node[];
export function traverseAncestors(node: Node, callback: (node: Node) => void): void;
export function traverseAncestors(node: Node, callback?: (node: Node) => void): void | Node[] {
	const visited: Set<NodeId> = new Set();
	const ancestors: Node[] = [];
	const visit = (n: Node) => {
		if (visited.has(n.id)) return;
		visited.add(n.id);
		n.parents.forEach(visit);
		if (callback) {
			callback(n);
		} else {
			ancestors.push(n);
		}
	};
	visit(node);
	if (!callback) {
		return ancestors;
	}
}

export function traverseDescendants(node: Node): Node[];
export function traverseDescendants(node: Node, callback: (node: Node) => void): void;
export function traverseDescendants(node: Node, callback?: (node: Node) => void): void | Node[] {
	const visited: Set<NodeId> = new Set();
	const descendants: Node[] = [];
	const visit = (n: Node) => {
		if (visited.has(n.id)) return;
		visited.add(n.id);
		n.children.forEach(visit);
		n.unlocks.forEach(visit);
		if (callback) {
			callback(n);
		} else {
			descendants.push(n);
		}
	};
	visit(node);
	if (!callback) {
		return descendants;
	}
}

export function build(graphData: GraphData): Graph {
	const graph: Graph = {};

	const createNode = (nodeData: NodeData): void => {
		const nodeId = generateNodeId(nodeData);
		if (graph[nodeId]) {
			throw new Error(`Duplicate node detected: ${nodeId}`);
		}
		graph[nodeId] = {
			id: nodeId,
			name: nodeData.name,
			type: nodeData.type,
			completed: false,
			selected: false,
			required: false,
			parents: [],
			children: [],
			unlocks: [],
		};
		if (nodeData.unlocks) nodeData.unlocks.forEach(createNode);
	};

	const createLinks = (nodeData: NodeData): void => {
		const nodeId = generateNodeId(nodeData);
		const node = graph[nodeId];

		if (nodeData.prereqs) {
			nodeData.prereqs.forEach((prereqData: NodeData) => {
				const prereqId = generateNodeId(prereqData);
				const prereqNode = graph[prereqId];
				if (!prereqNode) {
					throw new Error(`${nodeData.type} ${nodeData.name} depends on missing prerequisite: ${prereqData.type} ${prereqData.name}`);
				}
				node.parents.push(prereqNode);
				prereqNode.children.push(node);
			});
		}

		if (nodeData.unlocks) {
			nodeData.unlocks.forEach((unlockData: NodeData) => {
				const unlockId = generateNodeId(unlockData);
				const unlockNode = graph[unlockId];
				unlockNode.group = node;
				unlockNode.parents.push(node);
				node.unlocks.push(unlockNode);
			});
		}
	};

	graphData.nodes.forEach(createNode);
	graphData.nodes.forEach(createLinks);

	const errors: string[] = [];
	const visited: Set<NodeId> = new Set();
	const stack: Set<NodeId> = new Set();
	const visit = (node: Node) => {
		if (visited.has(node.id)) return;
		visited.add(node.id);
		stack.add(node.id);
		[...node.children, ...node.unlocks].forEach((child) => {
			if (stack.has(child.id)) {
				errors.push(`Invalid dependency from ${child.type} ${child.name} to ${node.type} ${node.name}`);
				return;
			}
			visit(child)
		});
		stack.delete(node.id);
	}
	Object.values(graph).forEach(visit);
	if (errors.length > 0) {
		throw new Error(`Graph contains cycles:\n${errors.join('\n')}`);
	}

	return graph;
}
