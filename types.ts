export interface GraphData {
	nodes: NodeData[];
};

export interface NodeData {
	name: string;
	type: string;
	prereqs?: NodeData[];
	unlocks?: NodeData[];
};

export type NodeId = string;

export interface Node {
	id: NodeId;
	name: string;
	type: string;
	completed: boolean;
	highlighted: boolean;
}
