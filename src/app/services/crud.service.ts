import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getGraphData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graph-data`);
  }


  addNodeAndRelationship(source: string, sourceLabel: string, target: string, targetLabel: string, type: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crud/add-node-relationship`, { source, sourceLabel, target, targetLabel, type });
  }

  updateNodeRelationship(source: string, oldTarget: string, newTarget: string, newTargetLabel: string, relationshipType: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/crud/update-node-relationship`, { source, oldTarget, newTarget, newTargetLabel, relationshipType });
  }

  deleteNode(name: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/crud/delete/${name}`);
  }

  getLabels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/crud/labels`);
  }

  processText(inputText: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crud/process`, { inputText });
  }
}
