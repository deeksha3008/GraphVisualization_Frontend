import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { CrudService } from '../services/crud.service';
import { WebSocketService } from '../services/web-socket.service';

interface GraphNode extends SimulationNodeDatum {
  id: string;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
  type: string;
}

@Component({
  selector: 'app-d3-graph',
  templateUrl: './d3-graph.component.html',
  styleUrls: ['./d3-graph.component.css']
})
export class D3GraphComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) private graphContainer!: ElementRef;

  private links: GraphLink[] = [];
  private nodes: GraphNode[] = [];
  private simulation!: d3.Simulation<GraphNode, GraphLink>;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  isLoading = true;

  constructor(private crudService: CrudService, private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.initializeSimulation();
    this.fetchGraphData();
    this.subscribeToGraphUpdates();
  }

  fetchGraphData(): void {
    this.crudService.getGraphData().subscribe({
      next: data => {
        if (data && data.links) {
          this.nodes = Array.from(new Set(data.links.flatMap((l: any) => [l.source, l.target])), (id: any) => ({ id } as GraphNode));
          this.links = data.links.map((d: any) => ({
            source: this.nodes.find(n => n.id === d.source) || { id: d.source } as GraphNode,
            target: this.nodes.find(n => n.id === d.target) || { id: d.target } as GraphNode,
            type: d.type
          }));
          this.initializeNodePositions();
          this.updateGraph();
          this.isLoading = false;
        }
      },
      error: err => {
        console.error('Failed to load graph data', err);
        this.isLoading = false;
      }
    });
  }

  initializeNodePositions() {
    const width = this.graphContainer.nativeElement.offsetWidth || 900;
    const height = this.graphContainer.nativeElement.offsetHeight || 700;
    this.nodes.forEach(node => {
      node.x = width / 2 + Math.random() * 100 - 50;
      node.y = height / 2 + Math.random() * 100 - 50;
    });
  }

  subscribeToGraphUpdates(): void {
    this.webSocketService.listen('graph-update').subscribe((data: any) => {
      this.fetchGraphData();
    });
  }

  initializeSimulation(): void {
    const element = this.graphContainer.nativeElement;
    const width = element.offsetWidth || 900;
    const height = element.offsetHeight || 700;

    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);

    this.simulation = d3.forceSimulation<GraphNode, GraphLink>()
      .force("link", d3.forceLink<GraphNode, GraphLink>().id(d => (d as GraphNode).id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(10 + 10));

    this.simulation.on("tick", () => this.ticked());
  }

  updateGraph(): void {
    this.simulation.nodes(this.nodes);
    this.simulation.force<d3.ForceLink<GraphNode, GraphLink>>("link")!.links(this.links);
    this.createGraph();
    this.simulation.alpha(1).restart();
  }

  createGraph(): void {
    const width = this.graphContainer.nativeElement.offsetWidth || 900;
    const height = this.graphContainer.nativeElement.offsetHeight || 700;
    const radius = 10;
    const padding = 20;

    this.svg.selectAll("*").remove(); // Clear existing elements

    const link = this.svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.links)
      .join("line")
      .attr("stroke-width", 2);

    const linkLabels = this.svg.append("g")
      .selectAll("text")
      .data(this.links)
      .enter().append("text")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text(d => d.type)
      .attr("fill", "black");

    const node = this.svg.append("g")
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", radius)
      .attr("fill", d => d3.scaleOrdinal(d3.schemeCategory10)(d.id));

    const labels = this.svg.append("g")
      .selectAll("text")
      .data(this.nodes)
      .enter().append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.id);

    this.ticked = () => {
      link
        .attr("x1", d => this.safeCoordinate((d.source as GraphNode).x, width, radius, padding))
        .attr("y1", d => this.safeCoordinate((d.source as GraphNode).y, height, radius, padding))
        .attr("x2", d => this.safeCoordinate((d.target as GraphNode).x, width, radius, padding))
        .attr("y2", d => this.safeCoordinate((d.target as GraphNode).y, height, radius, padding));

      linkLabels
        .attr("x", d => this.safeCoordinate(((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2, width, radius, padding))
        .attr("y", d => this.safeCoordinate(((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2, height, radius, padding));

      node
        .attr("cx", d => this.safeCoordinate(d.x, width, radius, padding))
        .attr("cy", d => this.safeCoordinate(d.y, height, radius, padding));

      labels
        .attr("x", d => this.safeCoordinate(d.x, width, radius, padding) + 12)
        .attr("y", d => this.safeCoordinate(d.y, height, radius, padding) + 5);
    };
  }

  private safeCoordinate(value: number | undefined, max: number, radius: number, padding: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return radius + padding;
    }
    return Math.max(radius + padding, Math.min(max - radius - padding, value));
  }

  private ticked(): void {
    const link = this.svg.selectAll<SVGLineElement, GraphLink>('line');
    const linkLabels = this.svg.selectAll<SVGTextElement, GraphLink>('text');
    const node = this.svg.selectAll<SVGCircleElement, GraphNode>('circle');
    const labels = this.svg.selectAll<SVGTextElement, GraphNode>('text');

    link
      .attr("x1", d => this.safeCoordinate((d.source as GraphNode).x, parseInt(this.svg.attr('width')), 10, 20))
      .attr("y1", d => this.safeCoordinate((d.source as GraphNode).y, parseInt(this.svg.attr('height')), 10, 20))
      .attr("x2", d => this.safeCoordinate((d.target as GraphNode).x, parseInt(this.svg.attr('width')), 10, 20))
      .attr("y2", d => this.safeCoordinate((d.target as GraphNode).y, parseInt(this.svg.attr('height')), 10, 20));

    linkLabels
      .attr("x", d => this.safeCoordinate(((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2, parseInt(this.svg.attr('width')), 10, 20))
      .attr("y", d => this.safeCoordinate(((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2, parseInt(this.svg.attr('height')), 10, 20));

    node
      .attr("cx", d => this.safeCoordinate(d.x, parseInt(this.svg.attr('width')), 10, 20))
      .attr("cy", d => this.safeCoordinate(d.y, parseInt(this.svg.attr('height')), 10, 20));

    labels
      .attr("x", d => this.safeCoordinate(d.x, parseInt(this.svg.attr('width')), 10, 20) + 12)
      .attr("y", d => this.safeCoordinate(d.y, parseInt(this.svg.attr('height')), 10, 20) + 5);
  }
}
