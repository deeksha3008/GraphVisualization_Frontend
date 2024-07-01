import { Component } from '@angular/core';
import { CrudService } from '../services/crud.service';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent {
  inputText: string = '';

  constructor(private crudService: CrudService) {}

  processText() {
    this.crudService.processText(this.inputText).subscribe({
      next: () => {
        console.log('Text processed successfully');
        this.inputText = '';
      },
      error: (err) => console.error('Failed to process text:', err)
    });
  }
}
