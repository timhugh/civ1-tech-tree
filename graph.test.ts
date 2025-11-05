import { describe, expect, test } from 'vitest';
import { GraphData } from './types';
import { Graph, type GraphNode } from './graph';

const graphData: GraphData = {
	nodes: [
		{ name: "Alphabet", type: "tech" },
		{ name: "Code of Laws", type: "tech", prereqs: [{ name: "Alphabet", type: "tech" }], unlocks: [{ name: "Courthouse", type: "building" }] },
		{ name: "Writing", type: "tech", prereqs: [{ name: "Alphabet", type: "tech" }], unlocks: [{ name: "Library", type: "building" }, { name: "Diplomat", type: "unit" }] },
		{ name: "Literacy", type: "tech", prereqs: [{ name: "Writing", type: "tech" }, { name: "Code of Laws", type: "tech"}], unlocks: [{ name: "Great Library", type: "wonder" }] },
	]
};

const graphDataWithMultipleGraphs: GraphData = {
	nodes: [
		{ name: "Pottery", type: "tech", unlocks: [{ name: "Granary", type: "building" }, { name: "Hanging Gardens", type: "wonder" }] },
		{ name: "Alphabet", type: "tech" },
		{ name: "Code of Laws", type: "tech", prereqs: [{ name: "Alphabet", type: "tech" }], unlocks: [{ name: "Courthouse", type: "building" }] },
		{ name: "Bronze Working", type: "tech", unlocks: [{ name: "Phalanx", type: "unit" }, { name: "Colossus", type: "wonder" }] },
		{ name: "Iron Working", type: "tech", prereqs: [{ name: "Bronze Working", type: "tech" }], unlocks: [{ name: "Legion", type: "unit" }] },
		{ name: "Currency", type: "tech", prereqs: [{ name: "Bronze Working", type: "tech" }], unlocks: [{ name: "Market", type: "building" }] },
	]
};

const graphDataWithCycles: GraphData = {
	nodes: [
		{ name: "A", type: "tech" },
		{ name: "B", type: "tech", prereqs: [{ name: "A", type: "tech" }, { name: "D", type: "unit" }, { name: "G", type: "tech" }] },
		{ name: "C", type: "tech", prereqs: [{ name: "B", type: "tech" }], unlocks: [{ name: "D", type: "unit" }] },
		{ name: "E", type: "tech", prereqs: [{ name: "B", type: "tech" }] },
		{ name: "F", type: "tech", prereqs: [{ name: "A", type: "tech" }] },
		{ name: "G", type: "tech", prereqs: [{ name: "F", type: "tech" }, { name: "E", type: "tech" }] },
	]
};

describe('Graph', () => {
	describe('initialization', () => {
		test('builds expected graph', () => {
			const graph = new Graph(graphData);
			const nodeAlphabet = graph.get('tech-alphabet');
			const nodeCodeOfLaws = graph.get('tech-code-of-laws');
			const nodeWriting = graph.get('tech-writing');
			const nodeLiteracy = graph.get('tech-literacy');
			const nodeCourthouse = graph.get('building-courthouse');
			const nodeLibrary = graph.get('building-library');
			const nodeDiplomat = graph.get('unit-diplomat');
			const nodeGreatLibrary = graph.get('wonder-great-library');

			expect(nodeAlphabet).toBeDefined();
			expect(nodeAlphabet!.parents).toHaveLength(0);
			expect(nodeAlphabet!.children).toContain(nodeCodeOfLaws!.id);
			expect(nodeAlphabet!.children).toContain(nodeWriting!.id);
			expect(nodeAlphabet!.group).toHaveLength(0);

			expect(nodeCodeOfLaws).toBeDefined();
			expect(nodeCodeOfLaws!.parents).toContain(nodeAlphabet!.id);
			expect(nodeCodeOfLaws!.children).toContain(nodeLiteracy!.id);
			expect(nodeCodeOfLaws!.group).toContain(nodeCourthouse!.id);

			expect(nodeWriting).toBeDefined();
			expect(nodeWriting!.parents).toContain(nodeAlphabet!.id);
			expect(nodeWriting!.children).toContain(nodeLiteracy!.id);
			expect(nodeWriting!.group).toContain(nodeLibrary!.id);
			expect(nodeWriting!.group).toContain(nodeDiplomat!.id);

			expect(nodeLiteracy).toBeDefined();
			expect(nodeLiteracy!.parents).toContain(nodeWriting!.id);
			expect(nodeLiteracy!.parents).toContain(nodeCodeOfLaws!.id);
			expect(nodeLiteracy!.children).toHaveLength(0);
			expect(nodeLiteracy!.group).toContain(nodeGreatLibrary!.id);
		});

		test('handles disconnected graphs', () => {
			const graph = new Graph(graphDataWithMultipleGraphs);
			const nodePottery = graph.get('tech-pottery');
			const nodeGranary = graph.get('building-granary');
			const nodeHangingGardens = graph.get('wonder-hanging-gardens');
			const nodeAlphabet = graph.get('tech-alphabet');
			const nodeCodeOfLaws = graph.get('tech-code-of-laws');
			const nodeBronzeWorking = graph.get('tech-bronze-working');
			const nodeIronWorking = graph.get('tech-iron-working');
			const nodeCurrency = graph.get('tech-currency');
			const nodePhalanx = graph.get('unit-phalanx');
			const nodeColossus = graph.get('wonder-colossus');
			const nodeLegion = graph.get('unit-legion');
			const nodeMarket = graph.get('building-market');

			expect(nodePottery).toBeDefined();
			expect(nodePottery!.parents).toHaveLength(0);
			expect(nodePottery!.children).toHaveLength(0);
			expect(nodePottery!.group).toContain(nodeGranary!.id);
			expect(nodePottery!.group).toContain(nodeHangingGardens!.id);

			expect(nodeAlphabet).toBeDefined();
			expect(nodeAlphabet!.parents).toHaveLength(0);
			expect(nodeAlphabet!.children).toContain(nodeCodeOfLaws!.id);

			expect(nodeBronzeWorking).toBeDefined();
			expect(nodeBronzeWorking!.parents).toHaveLength(0);
			expect(nodeBronzeWorking!.children).toContain(nodeIronWorking!.id);
			expect(nodeBronzeWorking!.children).toContain(nodeCurrency!.id);
			expect(nodeBronzeWorking!.group).toContain(nodePhalanx!.id);
			expect(nodeBronzeWorking!.group).toContain(nodeColossus!.id);

			expect(nodeIronWorking).toBeDefined();
			expect(nodeIronWorking!.parents).toContain(nodeBronzeWorking!.id);
			expect(nodeIronWorking!.children).toHaveLength(0);
			expect(nodeIronWorking!.group).toContain(nodeLegion!.id);

			expect(nodeCurrency).toBeDefined();
			expect(nodeCurrency!.parents).toContain(nodeBronzeWorking!.id);
			expect(nodeCurrency!.children).toHaveLength(0);
			expect(nodeCurrency!.group).toContain(nodeMarket!.id);
		});

		test('detects cycles', () => {
			var error: Error | undefined;
			try {
				new Graph(graphDataWithCycles);
			} catch (e) {
				error = e as Error;
			}
			expect(error).toBeDefined();
			expect(error!.message).toMatch(/Cycle detected: invalid dependency from tech B to unit D/);
			expect(error!.message).toMatch(/Cycle detected: invalid dependency from tech B to tech G/);
		});
	});

	describe('traversing', () => {
		test('gets parents', () => {
			const graph = new Graph(graphData);
			const parents = graph.parents('tech-literacy');
			expect(parents.length).toBe(2);
			const parentIds = parents.map(node => node.id);
			expect(parentIds).toContain('tech-writing');
			expect(parentIds).toContain('tech-code-of-laws');
		});

		test('errors on getting parents of non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.parents('non-existent-node');
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});

		test('gets children', () => {
			const graph = new Graph(graphData);
			const children = graph.children('tech-writing');
			expect(children.length).toBe(1);
			expect(children[0].id).toBe('tech-literacy');
		});

		test('errors on getting children of non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.children('non-existent-node');
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});
		
		test('gets ancestors', () => {
			const graph = new Graph(graphData);
			const ancestors = graph.ancestors('tech-literacy');
			expect(ancestors.length).toBe(3);
			const ancestorIds = ancestors.map(node => node.id);
			expect(ancestorIds).toContain('tech-writing');
			expect(ancestorIds).toContain('tech-alphabet');
			expect(ancestorIds).toContain('tech-code-of-laws');
		});

		test('errors on getting ancestors of non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.ancestors('non-existent-node');
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});

		test('gets descendants', () => {
			const graph = new Graph(graphData);
			const descendants = graph.descendants('tech-writing');
			expect(descendants.length).toBe(4);
			const descendantIds = descendants.map(node => node.id);
			expect(descendantIds).toContain('building-library');
			expect(descendantIds).toContain('unit-diplomat');
			expect(descendantIds).toContain('tech-literacy');
			expect(descendantIds).toContain('wonder-great-library');
		});

		test('errors on getting descendants of non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.descendants('non-existent-node');
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});

		test('traverses down', () => {
			const graph = new Graph(graphData);
			const visitedNodes: string[] = [];
			graph.traverse('tech-writing', 'down', (node: GraphNode) => {
				visitedNodes.push(node.id);
			});
			expect(visitedNodes.length).toBe(5);
			['tech-writing', 'building-library', 'unit-diplomat', 'tech-literacy', 'wonder-great-library'].forEach(id => {
				expect(visitedNodes).toContain(id);
			});
		});

		test('errors on traversing from non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.traverse('non-existent-node', 'down', () => {});
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});

		test('traverses up', () => {
			const graph = new Graph(graphData);
			const visitedNodes: string[] = [];
			graph.traverse('wonder-great-library', 'up', (node: GraphNode) => {
				visitedNodes.push(node.id);
			});
			expect(visitedNodes.length).toBe(5);
			['wonder-great-library', 'tech-literacy', 'tech-writing', 'tech-alphabet', 'tech-code-of-laws'].forEach(id => {
				expect(visitedNodes).toContain(id);
			});
		});

		test('errors on traversing to non-existent node', () => {
			const graph = new Graph(graphData);
			expect(() => {
				graph.traverse('non-existent-node', 'up', () => {});
			}).toThrow('Node with id non-existent-node does not exist in the graph.');
		});
	});
});
