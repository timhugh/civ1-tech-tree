import type { GraphData, NodeMap, Node } from './types';
import * as graph from './graph';
import * as go from 'gojs';

interface GoNodeData extends go.ObjectData {
	key: string;
}

interface GoLinkData extends go.ObjectData {
	from: string;
	to: string;
}

export class Diagram {
	private graph: NodeMap;
	private godiagram: go.Diagram;

	constructor(
		private container: HTMLElement,
		private graphData: GraphData,
	) {
		this.graph = graph.build(graphData);
		this.godiagram = this.buildGoDiagram();
	}

	focusNode(node: Node): void {
		const gonode = this.godiagram.findNodeForKey(node.id);
		if (!gonode) {
			console.warn(`Node not found in diagram: ${node.id}`);
			return;
		}
		this.godiagram.scale = 1.5;
		this.godiagram.scrollToRect(gonode.actualBounds);
	}

	unfocus(): void {
		this.godiagram.zoomToFit();
	}

	clearCompleted(): void {
		Object.values(this.graph).forEach(node => {
			node.completed = false;
			node.required = false;
			node.selected = false;
		});
		this.updateDiagram();
	}

	clearSelected(): void {
		Object.values(this.graph).forEach(node => {
			node.selected = false;
			node.required = false;
		});
		this.updateDiagram();
	}

	toggleCompleted(node: Node): void {
		node.completed = !node.completed;
		this.updateDiagram();
	}

	toggleSelected(node: Node): void {
		this.godiagram.startTransaction('toggleSelected');
		if (node.selected) {
			this.clearSelected();
		} else {
			node.selected = true;
			graph.traverseAncestors(node, (ancestor) => {
				ancestor.required = true;
			});
		}
		this.updateDiagram();
		this.godiagram.commitTransaction('toggleSelected');
	}

	findNode(predicate: (node: Node) => boolean): Node | null {
		const results = this.filterNodes(predicate);
		return results.length > 0 ? results[0] : null;
	}

	filterNodes(predicate: (node: Node) => boolean): Node[] {
		return Object.values(this.graph).filter(predicate);
	}

	private updateDiagram(): void {
		this.godiagram.nodes.each(node => {
			node.updateTargetBindings();
		});
	}

	private getNodeColor(node: Node, theme: 'light' | 'dark' = 'light'): string {
		if (node.selected) {
			return 'yellow';
		}
		if (node.required && !node.completed) {
			return 'red';
		}
		if (node.required && node.completed) {
			return 'green';
		}
		if (node.completed) {
			return 'gray';
		}
		const themeData = this.graphData.styles[theme];
		return themeData[node.type] || 'gray';
	}

	private buildGoDiagram(): go.Diagram {
		const godiagram = new go.Diagram(this.container, {
			initialAutoScale: go.AutoScale.Uniform,
			'undoManager.isEnabled': true,
			layout: new go.LayeredDigraphLayout({
				direction: 90,
				layeringOption: go.LayeredDigraphLayering.LongestPathSource,
				alignOption: go.LayeredDigraphAlign.None,
			}),
			'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
		});

		godiagram.themeManager.currentTheme = 'system';
		godiagram.themeManager.changesDivBackground = true;

		const nodeSettings = {
			click: (_: any, data: any) => {
				this.toggleSelected(this.graph[data.key]);
			},
			doubleClick: (_: any, data: any) => {
				this.toggleCompleted(this.graph[data.key]);
			}
		};

		const buildNodeShapes = () => {
			return [
				new go.Shape("RoundedRectangle", {}).bind('fill', '', (data: any) => {
					return this.getNodeColor(this.graph[data.key], godiagram.themeManager.preferredColorScheme);
				}).theme('stroke', 'link'),
				new go.TextBlock({
					margin: 10,
				})
					.bind("text", "name")
					.bind('font', '', (data) => {
						const node = this.graph[data.key];
						return node.completed ? 'Italic 13px sans-serif' : '13px sans-serif';
					})
					.theme('stroke', 'text')
			]
		};

		godiagram.groupTemplate = new go.Group("Auto", { ...nodeSettings }).add(
			new go.Panel("Auto", {}).add(
				...buildNodeShapes(), new go.Placeholder({ margin: 5 })
			));
		godiagram.nodeTemplate = new go.Node("Auto", { ...nodeSettings, }).add(...buildNodeShapes());

		godiagram.linkTemplate = new go.Link({
			routing: go.Link.AvoidsNodes,
			corner: 5,
		}).add(
			new go.Shape({
				toArrow: "OpenTriangle",
			}).theme('stroke', 'link')
		);

		const gonodes: { [key: string]: GoNodeData } = {};
		const golinks: GoLinkData[] = [];

		Object.values(this.graph).forEach(node => {
			gonodes[node.id] = {
				key: node.id,
				name: node.name,
				isGroup: node.unlocks.length > 0,
				group: node.group?.id,
			};

			node.children.forEach(child => {
				const golink = { from: node.id, to: child.id };
				golinks.push(golink);
			});
		});

		godiagram.model = new go.GraphLinksModel(Object.values(gonodes), golinks);

		return godiagram;
	}
}
