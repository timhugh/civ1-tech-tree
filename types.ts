export interface NodeData {
	name: string;
	type: string;
	prereqs?: NodeData[];
	unlocks?: NodeData[];
};

export interface StyleData {
	[key: string]: any;
}

export interface GraphData {
	styles: StyleData;
	nodes: NodeData[];
};
