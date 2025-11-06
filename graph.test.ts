import { describe, expect, test } from 'vitest';
import { GraphData } from './types';
import * as graph from './graph';

const graphData: GraphData = {
	nodes: [
		{ name: "Alphabet", type: "technology" },
		{ name: "Code of Laws", type: "technology", prereqs: [{ name: "Alphabet", type: "technology" }], unlocks: [{ name: "Courthouse", type: "building" }] },
		{ name: "Writing", type: "technology", prereqs: [{ name: "Alphabet", type: "technology" }], unlocks: [{ name: "Library", type: "building" }, { name: "Diplomat", type: "unit" }] },
		{ name: "Literacy", type: "technology", prereqs: [{ name: "Writing", type: "technology" }, { name: "Code of Laws", type: "technology"}], unlocks: [{ name: "Great Library", type: "wonder" }] },
	]
};

const graphDataWithMultipleGraphs: GraphData = {
	nodes: [
		{ name: "Pottery", type: "technology", unlocks: [{ name: "Granary", type: "building" }, { name: "Hanging Gardens", type: "wonder" }] },
		{ name: "Alphabet", type: "technology" },
		{ name: "Code of Laws", type: "technology", prereqs: [{ name: "Alphabet", type: "technology" }], unlocks: [{ name: "Courthouse", type: "building" }] },
		{ name: "Bronze Working", type: "technology", unlocks: [{ name: "Phalanx", type: "unit" }, { name: "Colossus", type: "wonder" }] },
		{ name: "Iron Working", type: "technology", prereqs: [{ name: "Bronze Working", type: "technology" }], unlocks: [{ name: "Legion", type: "unit" }] },
		{ name: "Currency", type: "technology", prereqs: [{ name: "Bronze Working", type: "technology" }], unlocks: [{ name: "Market", type: "building" }] },
	]
};

const graphDataWithCycles: GraphData = {
	nodes: [
		{ name: "A", type: "technology" },
		{ name: "B", type: "technology", prereqs: [{ name: "A", type: "technology" }, { name: "D", type: "unit" }, { name: "G", type: "technology" }] },
		{ name: "C", type: "technology", prereqs: [{ name: "B", type: "technology" }], unlocks: [{ name: "D", type: "unit" }] },
		{ name: "E", type: "technology", prereqs: [{ name: "B", type: "technology" }] },
		{ name: "F", type: "technology", prereqs: [{ name: "A", type: "technology" }] },
		{ name: "G", type: "technology", prereqs: [{ name: "F", type: "technology" }, { name: "E", type: "technology" }] },
	]
};

describe('buildGraph', () => {
	test('builds a simple graph', () => {
		const g = graph.build(graphData);
		expect(Object.keys(g).length).toBe(8);

		const alphabet = g['technology_alphabet'];
		const codeOfLaws = g['technology_code_of_laws'];
		const writing = g['technology_writing'];
		const literacy = g['technology_literacy'];
		const courthouse = g['building_courthouse'];
		const library = g['building_library'];
		const diplomat = g['unit_diplomat'];
		const greatLibrary = g['wonder_great_library'];

		expect(alphabet).toEqual({
			id: 'technology_alphabet',
			name: 'Alphabet',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: [],
			children: expect.arrayContaining([codeOfLaws]),
			unlocks: [],
		});
		expect(codeOfLaws).toEqual({
			id: 'technology_code_of_laws',
			name: 'Code of Laws',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([alphabet]),
			children: expect.arrayContaining([literacy]),
			unlocks: expect.arrayContaining([courthouse]),
		});
		expect(courthouse).toEqual({
			id: 'building_courthouse',
			name: 'Courthouse',
			type: 'building',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([codeOfLaws]),
			children: [],
			unlocks: [],
			group: codeOfLaws,
		});
		expect(writing).toEqual({
			id: 'technology_writing',
			name: 'Writing',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([alphabet]),
			children: expect.arrayContaining([literacy]),
			unlocks: expect.arrayContaining([library, diplomat]),
		});
		expect(literacy).toEqual({
			id: 'technology_literacy',
			name: 'Literacy',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([writing, codeOfLaws]),
			children: [],
			unlocks: expect.arrayContaining([greatLibrary]),
		});
	});

	test('builds a graph with multiple disconnected subgraphs', () => {
		const g = graph.build(graphDataWithMultipleGraphs);
		expect(Object.keys(g).length).toBe(13);

		const pottery = g['technology_pottery'];
		const granary = g['building_granary'];
		const hangingGardens = g['wonder_hanging_gardens'];

		const alphabet = g['technology_alphabet'];
		const codeOfLaws = g['technology_code_of_laws'];
		const courthouse = g['building_courthouse'];

		const bronzeWorking = g['technology_bronze_working'];
		const phalanx = g['unit_phalanx'];
		const colossus = g['wonder_colossus'];
		const ironWorking = g['technology_iron_working'];
		const legion = g['unit_legion'];
		const currency = g['technology_currency'];
		const market = g['building_market'];

		expect(pottery).toEqual({
			id: 'technology_pottery',
			name: 'Pottery',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: [],
			children: [],
			unlocks: expect.arrayContaining([granary, hangingGardens]),
		});
		expect(granary).toEqual({
			id: 'building_granary',
			name: 'Granary',
			type: 'building',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([pottery]),
			children: [],
			unlocks: [],
			group: pottery,
		});
		expect(hangingGardens).toEqual({
			id: 'wonder_hanging_gardens',
			name: 'Hanging Gardens',
			type: 'wonder',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([pottery]),
			children: [],
			unlocks: [],
			group: pottery,
		});

		expect(alphabet).toEqual({
			id: 'technology_alphabet',
			name: 'Alphabet',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: [],
			children: expect.arrayContaining([codeOfLaws]),
			unlocks: [],
		});
		expect(codeOfLaws).toEqual({
			id: 'technology_code_of_laws',
			name: 'Code of Laws',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([alphabet]),
			children: [],
			unlocks: expect.arrayContaining([courthouse]),
		});
		expect(courthouse).toEqual({
			id: 'building_courthouse',
			name: 'Courthouse',
			type: 'building',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([codeOfLaws]),
			children: [],
			unlocks: [],
			group: codeOfLaws,
		});

		expect(bronzeWorking).toEqual({
			id: 'technology_bronze_working',
			name: 'Bronze Working',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: [],
			children: expect.arrayContaining([ironWorking]),
			unlocks: expect.arrayContaining([phalanx, colossus]),
		});
		expect(phalanx).toEqual({
			id: 'unit_phalanx',
			name: 'Phalanx',
			type: 'unit',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([bronzeWorking]),
			children: [],
			unlocks: [],
			group: bronzeWorking,
		});
		expect(colossus).toEqual({
			id: 'wonder_colossus',
			name: 'Colossus',
			type: 'wonder',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([bronzeWorking]),
			children: [],
			unlocks: [],
			group: bronzeWorking,
		});
		expect(ironWorking).toEqual({
			id: 'technology_iron_working',
			name: 'Iron Working',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([bronzeWorking]),
			children: [],
			unlocks: expect.arrayContaining([legion]),
		});
		expect(legion).toEqual({
			id: 'unit_legion',
			name: 'Legion',
			type: 'unit',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([ironWorking]),
			children: [],
			unlocks: [],
			group: ironWorking,
		});
		expect(currency).toEqual({
			id: 'technology_currency',
			name: 'Currency',
			type: 'technology',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([bronzeWorking]),
			children: [],
			unlocks: expect.arrayContaining([market]),
		});
		expect(market).toEqual({
			id: 'building_market',
			name: 'Market',
			type: 'building',
			completed: false,
			highlighted: false,
			selected: false,
			parents: expect.arrayContaining([currency]),
			children: [],
			unlocks: [],
			group: currency,
		});
	});

	test('detects cycles in graph', () => {
		var error: Error | undefined;
		try {
			graph.build(graphDataWithCycles);
		} catch (e) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error!.message).toMatch('Graph contains cycles');
		expect(error!.message).toMatch('Invalid dependency from technology B to unit D');
		expect(error!.message).toMatch('Invalid dependency from technology B to technology G');
	});

	test('detects missing prerequisites', () => {
		const graphWithMissingNode: GraphData = {
			nodes: [
				{ name: "Tech1", type: "technology", prereqs: [{ name: "NonExistentTech", type: "technology" }] },
			]
		};
		expect(() => graph.build(graphWithMissingNode))
			.toThrowError('technology Tech1 depends on missing prerequisite: technology NonExistentTech');
	});
});

describe('traversal', () => {
	const g = graph.build(graphData);

	describe('traverseDescendants', () => {
		test('traverses ancestors with callback', () => {
			const literacy = g['technology_literacy'];
			const ancestors: string[] = [];
			graph.traverseAncestors(literacy, (node) => {
				ancestors.push(node.id);
			});
			expect(ancestors).toEqual(expect.arrayContaining([
				'technology_writing',
				'technology_alphabet',
				'technology_code_of_laws',
			]));
		});

		test('traverses ancestors without callback', () => {
			const literacy = g['technology_literacy'];
			const ancestors = graph.traverseAncestors(literacy);
			const ancestorIds = ancestors.map(node => node.id);
			expect(ancestorIds).toEqual(expect.arrayContaining([
				'technology_writing',
				'technology_alphabet',
				'technology_code_of_laws',
			]));
		});
	});

	describe('traverseAncestors', () => {
		test('traverses descendants with callback', () => {
			const alphabet = g['technology_alphabet'];
			const descendants: string[] = [];
			graph.traverseDescendants(alphabet, (node) => {
				descendants.push(node.id);
			});
			expect(descendants).toEqual(expect.arrayContaining([
				'technology_writing',
				'technology_code_of_laws',
				'technology_literacy',
				'building_library',
				'unit_diplomat',
				'wonder_great_library',
				'building_courthouse',
			]));
		});

		test('traverses descendants without callback', () => {
			const alphabet = g['technology_alphabet'];
			const descendants = graph.traverseDescendants(alphabet);
			const descendantIds = descendants.map(node => node.id);
			expect(descendantIds).toEqual(expect.arrayContaining([
				'technology_writing',
				'technology_code_of_laws',
				'technology_literacy',
				'building_library',
				'unit_diplomat',
				'wonder_great_library',
				'building_courthouse',
			]));
		});
	});
});
