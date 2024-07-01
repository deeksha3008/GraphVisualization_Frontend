import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CrudOperationsComponent } from './crud-operations/crud-operations.component';
import { D3GraphComponent } from './d3-graph/d3-graph.component';
import { TextInputComponent } from './text-input/text-input.component';

import { CrudService } from './services/crud.service';
import { WebSocketService } from './services/web-socket.service';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    CrudOperationsComponent,
    D3GraphComponent,
    TextInputComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule, // Add FormsModule here
    MatCardModule
  ],
  providers: [
    CrudService,
    WebSocketService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
