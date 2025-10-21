import { Routes } from '@angular/router';
import { JobSeekersComponent } from './job-seekers.component';
import { CampaignComponent } from './campaign.component';

export const routes: Routes = [
  { path: '', component: JobSeekersComponent },
  { path: 'campaign', component: CampaignComponent },
  { path: '**', redirectTo: '' }
];
