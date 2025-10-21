import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CrmService, DripStep, EmailTemplate, TimeIntervalOption } from './crm.service';

interface TemplateFormState {
  name: string;
  description: string;
  content: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly title = 'Drip Campaign Builder';

  emailTemplates: EmailTemplate[] = [];
  timeIntervals: TimeIntervalOption[] = [];

  numDrips = 3;
  drips: DripStep[] = [
    { id: 1, template: '', interval: 0, customInterval: 1 },
    { id: 2, template: '', interval: 3, customInterval: 3 },
    { id: 3, template: '', interval: 7, customInterval: 7 }
  ];
  globalInterval = 3;
  campaignName = '';

  showTemplateModal = false;
  showCreateModal = false;
  selectedTemplatePreview: string | null = null;

  templateForm: TemplateFormState = {
    name: '',
    description: '',
    content: ''
  };

  statusMessage: string | null = null;
  statusType: 'success' | 'error' | null = null;
  isSaving = false;

  constructor(private readonly crmService: CrmService) {}

  ngOnInit(): void {
    this.fetchTemplates();
    this.fetchTimeIntervals();
  }

  get totalDays(): number {
    return this.drips.reduce((sum, drip) => sum + (drip.id === 1 ? 0 : drip.interval), 0);
  }

  get configuredDrips(): number {
    return this.drips.filter((drip) => Boolean(drip.template)).length;
  }

  private fetchTemplates(): void {
    this.crmService.getTemplates().subscribe({
      next: (templates) => {
        this.emailTemplates = templates;
      },
      error: () => {
        // Fallback to local defaults if API is unavailable
        this.emailTemplates = [
          { id: 'welcome', name: 'Welcome Email', description: 'Introduce your brand', content: '' },
          { id: 'intro', name: 'Product Introduction', description: 'Showcase your product', content: '' },
          { id: 'case_study', name: 'Case Study', description: 'Share success stories', content: '' }
        ];
      }
    });
  }

  private fetchTimeIntervals(): void {
    this.crmService.getTimeIntervals().subscribe({
      next: (intervals) => {
        this.timeIntervals = intervals;
      },
      error: () => {
        this.timeIntervals = [
          { value: 1, label: '1 day' },
          { value: 3, label: '3 days' },
          { value: 7, label: '1 week' }
        ];
      }
    });
  }

  handleDripCountChange(value: string | number): void {
    const newCount = Math.max(1, Number(value) || 1);
    this.numDrips = newCount;

    if (newCount > this.drips.length) {
      const newDrips = [...this.drips];
      for (let i = this.drips.length; i < newCount; i += 1) {
        newDrips.push({
          id: i + 1,
          template: '',
          interval: i === 0 ? 0 : this.globalInterval,
          customInterval: this.globalInterval
        });
      }
      this.drips = newDrips;
    } else if (newCount < this.drips.length) {
      this.drips = this.drips.slice(0, newCount).map((drip, index) => ({
        ...drip,
        id: index + 1
      }));
    }
  }

  updateDripTemplate(id: number, templateId: string): void {
    this.drips = this.drips.map((drip) =>
      drip.id === id ? { ...drip, template: templateId } : drip
    );
  }

  updateDripInterval(id: number, interval: number): void {
    this.drips = this.drips.map((drip) =>
      drip.id === id ? { ...drip, interval, customInterval: interval } : drip
    );
  }

  addDrip(): void {
    const nextId = this.drips.length + 1;
    this.drips = [
      ...this.drips,
      {
        id: nextId,
        template: '',
        interval: this.globalInterval,
        customInterval: this.globalInterval
      }
    ];
    this.numDrips = nextId;
  }

  removeDrip(id: number): void {
    if (this.drips.length <= 1) {
      return;
    }

    this.drips = this.drips
      .filter((drip) => drip.id !== id)
      .map((drip, index) => ({ ...drip, id: index + 1 }));
    this.numDrips = this.drips.length;
  }

  applyGlobalInterval(): void {
    this.drips = this.drips.map((drip, index) => ({
      ...drip,
      interval: index === 0 ? 0 : this.globalInterval,
      customInterval: index === 0 ? 0 : this.globalInterval
    }));
  }

  openTemplateModal(): void {
    this.showTemplateModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
  }

  openCreateModal(): void {
    this.resetTemplateForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  previewTemplate(templateId: string): void {
    this.selectedTemplatePreview = templateId;
  }

  closePreview(): void {
    this.selectedTemplatePreview = null;
  }

  saveCampaign(): void {
    this.isSaving = true;
    this.statusMessage = null;

    const payload = {
      name: this.campaignName || 'Untitled Campaign',
      drips: this.drips.map((drip) => ({
        id: drip.id,
        template: drip.template,
        interval: drip.id === 1 ? 0 : drip.interval
      }))
    };

    this.crmService.saveCampaign(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.statusType = 'success';
        this.statusMessage = 'Campaign saved successfully!';
      },
      error: () => {
        this.isSaving = false;
        this.statusType = 'error';
        this.statusMessage = 'Unable to save campaign. Please try again later.';
      }
    });
  }

  createTemplate(): void {
    if (!this.templateForm.name || !this.templateForm.description || !this.templateForm.content) {
      this.statusType = 'error';
      this.statusMessage = 'Please fill out all template fields before submitting.';
      return;
    }

    this.crmService.createTemplate(this.templateForm).subscribe({
      next: (template) => {
        this.emailTemplates = [...this.emailTemplates, template];
        this.showCreateModal = false;
        this.statusType = 'success';
        this.statusMessage = 'Template created successfully!';
        this.resetTemplateForm();
      },
      error: () => {
        this.statusType = 'error';
        this.statusMessage = 'Unable to create template. Please try again later.';
      }
    });
  }

  trackByDripId(_: number, drip: DripStep): number {
    return drip.id;
  }

  getTemplateName(templateId: string): string {
    const template = this.emailTemplates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  }

  getTemplateDescription(templateId: string): string {
    const template = this.emailTemplates.find(t => t.id === templateId);
    return template?.description || '';
  }

  getTemplateContent(templateId: string): string {
    const template = this.emailTemplates.find(t => t.id === templateId);
    return template?.content || '';
  }

  private resetTemplateForm(): void {
    this.templateForm = {
      name: '',
      description: '',
      content: ''
    };
  }
}
