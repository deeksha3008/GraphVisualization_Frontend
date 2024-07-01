import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-crud-operations',
  templateUrl: './crud-operations.component.html',
  styleUrls: ['./crud-operations.component.css']
})
export class CrudOperationsComponent implements OnInit {
  label = '';
  name = '';
  properties = {};
  source: string = '';
  target: string = '';
  sourceLabel: string = '';
  targetLabel: string = '';
  type: string = '';
  relationshipSource: string = '';  // Source node name
  relationshipType: string = '';  // Current type of the relationship
  oldRelationshipTarget: string ='';
  newRelationshipTarget: string = '';
  newRelationshipTargetLabel: string = ''; 
  nodes: any[] = [];  // Array to hold node data
  labels: string[] = [];  // Default labels
  relationships: string[] = [];
  constructor(private crudService: CrudService,private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.fetchGraphData();
    this.fetchLabels();
    this.subscribeToWebSocketEvents();
  }

  fetchGraphData(): void {
    this.crudService.getGraphData().subscribe({
      next: data => {
        this.nodes = data.nodes as { name: string; type: string }[];
        const uniqueRelationships = new Set((data.links as { type: string }[]).map(link => link.type));
        this.relationships = Array.from(uniqueRelationships);
      },
      error: err => {
        console.error('Failed to load graph data', err);
      }
    });
  }

  fetchLabels(): void {
    this.crudService.getLabels().subscribe({
      next: labels => {
        this.labels = labels;
      },
      error: err => {
        console.error('Failed to load labels', err);
      }
    });
  }

  subscribeToWebSocketEvents(): void {
    this.webSocketService.listen('graph-update').subscribe((update: any) => {
     this.fetchGraphData();
     this.fetchLabels();
    });
  }

  

  onSubmitUpdateRelationship() {
    this.crudService.updateNodeRelationship(
      this.relationshipSource, 
      this.oldRelationshipTarget, 
      this.newRelationshipTarget, 
      this.newRelationshipTargetLabel, // Include the label of the new target node
      this.relationshipType
    ).subscribe({
      next: (response) => {
        console.log('Relationship updated successfully', response);
        this.relationshipSource = '';
        this.oldRelationshipTarget = '';
        this.newRelationshipTarget = '';
        this.newRelationshipTargetLabel = '';
        this.relationshipType = '';
      },
      error: (error) => console.error('Failed to update relationship', error)
    });
  }

  onSubmit() {
    this.crudService.addNodeAndRelationship(
      this.source,
      this.sourceLabel,
      this.target,
      this.targetLabel,
      this.type
    ).subscribe({
      next: (response) => {
        console.log('Node and relationship added successfully', response);
        this.source = '';
        this.sourceLabel = '';
        this.target = '';
        this.targetLabel = '';
        this.type = '';
      },
      error: (error) => console.error('Failed to add node and relationship', error)
    });
  }

  deleteNode() {
    this.crudService.deleteNode(this.name).subscribe({
      next: () => {
        this.name = '';
      },
      error: (err) => console.error('Failed to delete node:', err)
    });
  }
}
