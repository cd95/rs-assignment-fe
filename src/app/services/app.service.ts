import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}
  getTemplates() {
    return this.http.get('http://localhost:3002/api/source/template/');
  }
  getTemplate(type: String) {
    return this.http.get(`http://localhost:3002/api/source/template/${type}`);
  }
  saveConfiguration(config: any) {
    return this.http.post('http://localhost:3002/api/source/configuration/', {
      config,
    });
  }
}
