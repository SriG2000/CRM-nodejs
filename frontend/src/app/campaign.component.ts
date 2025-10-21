import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CrmService, DripStep, EmailTemplate, TimeIntervalOption } from './crm.service';

interface TemplateFormState {
  name: string;
  description: string;
  content: string;
  category: string;
  logoUrl?: string;
  signature: {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    photoUrl?: string;
  };
}

@Component({
  selector: 'app-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements OnInit {
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
  activeTab: 'basic' | 'content' | 'signature' | 'preview' = 'basic';

  templateForm: TemplateFormState = {
    name: '',
    description: '',
    content: '',
    category: 'welcome',
    logoUrl: '',
    signature: {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      photoUrl: ''
    }
  };

  statusMessage: string | null = null;
  statusType: 'success' | 'error' | null = null;
  isSaving = false;

  constructor(private readonly crmService: CrmService, private router: Router) {}

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

  getIntervalLabel(intervalValue: number): string {
    const interval = this.timeIntervals.find(t => t.value === intervalValue);
    return interval?.label || 'N/A';
  }

  goBackToJobSeekers(): void {
    this.router.navigate(['/']);
  }

  // Template Creator Methods
  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.templateForm.logoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.templateForm.logoUrl = '';
  }

  onSignaturePhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.templateForm.signature.photoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSignaturePhoto(): void {
    this.templateForm.signature.photoUrl = '';
  }

  onContentChange(event: Event): void {
    const target = event.target as HTMLElement;
    this.templateForm.content = target.innerHTML;
  }

  formatText(command: string): void {
    document.execCommand(command, false);
  }

  insertHeading(tag: string): void {
    document.execCommand('formatBlock', false, tag);
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  insertImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          document.execCommand('insertHTML', false, img.outerHTML);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  insertButton(): void {
    const text = prompt('Enter button text:') || 'Click Here';
    const url = prompt('Enter button URL:') || '#';
    const buttonHtml = `<a href="${url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0;">${text}</a>`;
    document.execCommand('insertHTML', false, buttonHtml);
  }

  insertDivider(): void {
    const dividerHtml = '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">';
    document.execCommand('insertHTML', false, dividerHtml);
  }

  getSignaturePreview(): string {
    const sig = this.templateForm.signature;
    if (!sig.name && !sig.title && !sig.company) {
      return '<p style="color: #6b7280; font-style: italic;">No signature configured</p>';
    }

    let signatureHtml = '<div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">';
    
    if (sig.photoUrl) {
      signatureHtml += `<img src="${sig.photoUrl}" alt="Profile Photo" style="width: 80px; height: 80px; border-radius: 50%; float: left; margin-right: 15px; margin-bottom: 10px;" />`;
    }
    
    signatureHtml += '<div style="overflow: hidden;">';
    
    if (sig.name) {
      signatureHtml += `<h4 style="margin: 0 0 5px 0; font-size: 16px; color: #1f2937;">${sig.name}</h4>`;
    }
    
    if (sig.title) {
      signatureHtml += `<p style="margin: 0 0 5px 0; font-size: 14px; color: #3b82f6; font-weight: 600;">${sig.title}</p>`;
    }
    
    if (sig.company) {
      signatureHtml += `<p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">${sig.company}</p>`;
    }
    
    signatureHtml += '<div style="font-size: 13px; color: #6b7280; line-height: 1.4;">';
    
    if (sig.email) {
      signatureHtml += `<p style="margin: 2px 0;"><strong>Email:</strong> ${sig.email}</p>`;
    }
    
    if (sig.phone) {
      signatureHtml += `<p style="margin: 2px 0;"><strong>Phone:</strong> ${sig.phone}</p>`;
    }
    
    if (sig.address) {
      signatureHtml += `<p style="margin: 2px 0;"><strong>Address:</strong> ${sig.address}</p>`;
    }
    
    signatureHtml += '</div></div></div>';
    
    return signatureHtml;
  }

  getFullTemplatePreview(): string {
    return this.templateForm.content + this.getSignaturePreview();
  }

  refreshPreview(): void {
    // Trigger change detection for preview
    this.templateForm = { ...this.templateForm };
  }

  private resetTemplateForm(): void {
    this.templateForm = {
      name: '',
      description: '',
      content: '',
      category: 'welcome',
      logoUrl: '',
      signature: {
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        photoUrl: ''
      }
    };
    this.activeTab = 'basic';
  }
}
