import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface TimeIntervalOption {
  value: number;
  label: string;
}

export interface DripStep {
  id: number;
  template: string;
  interval: number;
  customInterval: number;
}

export interface CampaignPayload {
  name: string;
  drips: Array<{
    id: number;
    template: string;
    interval: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class CrmService {
  constructor(private readonly http: HttpClient) {}

  getTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>('/api/templates');
  }

  createTemplate(template: { name: string; description: string; content: string }): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>('/api/templates', template);
  }

  getTimeIntervals(): Observable<TimeIntervalOption[]> {
    return this.http.get<TimeIntervalOption[]>('/api/time-intervals');
  }

  saveCampaign(payload: CampaignPayload): Observable<any> {
    return this.http.post('/api/campaigns', payload);
  }
}
