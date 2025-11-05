export interface NodeData {
	name: string;
	type: string;
	prereqs?: NodeData[];
	unlocks?: NodeData[];
};

export interface GraphData {
	nodes: NodeData[];
};
