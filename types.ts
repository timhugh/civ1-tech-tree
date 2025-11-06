export interface GraphData {
	styles: StylesData;
	nodes: NodeData[];
};

export interface StylesData {
	light: ThemeData;
	dark: ThemeData;
};

export interface ThemeData {
	[theme: string]: string;
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
	selected: boolean;
	required: boolean;
	parents: Array<Node>;
	children: Array<Node>;
	unlocks: Array<Node>;
	group?: Node;
}

export interface NodeMap {
	[id: string]: Node;
}

