import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface JobSeeker {
  id: number;
  name: string;
  email: string;
  position: string;
  experience: string;
  location: string;
  skills: string[];
  status: 'active' | 'contacted' | 'interviewed' | 'hired';
  lastContact?: Date;
}

@Component({
  selector: 'app-job-seekers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './job-seekers.component.html',
  styleUrls: ['./job-seekers.component.css']
})
export class JobSeekersComponent implements OnInit {
  jobSeekers: JobSeeker[] = [];
  selectedJobSeekers: Set<number> = new Set();
  selectAll = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadJobSeekers();
  }

  loadJobSeekers(): void {
    // Dummy data for job seekers
    this.jobSeekers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        position: 'Frontend Developer',
        experience: '3 years',
        location: 'San Francisco, CA',
        skills: ['Angular', 'React', 'TypeScript', 'CSS'],
        status: 'active',
        lastContact: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        position: 'Backend Developer',
        experience: '5 years',
        location: 'New York, NY',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        status: 'contacted',
        lastContact: new Date('2024-01-20')
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        position: 'Full Stack Developer',
        experience: '4 years',
        location: 'Austin, TX',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        status: 'interviewed',
        lastContact: new Date('2024-01-18')
      },
      {
        id: 4,
        name: 'David Kim',
        email: 'david.kim@email.com',
        position: 'DevOps Engineer',
        experience: '6 years',
        location: 'Seattle, WA',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
        status: 'active',
        lastContact: new Date('2024-01-22')
      },
      {
        id: 5,
        name: 'Lisa Wang',
        email: 'lisa.wang@email.com',
        position: 'UI/UX Designer',
        experience: '2 years',
        location: 'Los Angeles, CA',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        status: 'hired',
        lastContact: new Date('2024-01-25')
      },
      {
        id: 6,
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        position: 'Product Manager',
        experience: '7 years',
        location: 'Chicago, IL',
        skills: ['Agile', 'Scrum', 'Analytics', 'Strategy'],
        status: 'contacted',
        lastContact: new Date('2024-01-19')
      },
      {
        id: 7,
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        position: 'Data Scientist',
        experience: '4 years',
        location: 'Boston, MA',
        skills: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
        status: 'active',
        lastContact: new Date('2024-01-21')
      },
      {
        id: 8,
        name: 'Alex Thompson',
        email: 'alex.thompson@email.com',
        position: 'Mobile Developer',
        experience: '3 years',
        location: 'Denver, CO',
        skills: ['React Native', 'iOS', 'Android', 'Swift'],
        status: 'interviewed',
        lastContact: new Date('2024-01-17')
      }
    ];
  }

  toggleSelection(jobSeekerId: number): void {
    if (this.selectedJobSeekers.has(jobSeekerId)) {
      this.selectedJobSeekers.delete(jobSeekerId);
    } else {
      this.selectedJobSeekers.add(jobSeekerId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedJobSeekers.clear();
    } else {
      this.jobSeekers.forEach(seeker => {
        this.selectedJobSeekers.add(seeker.id);
      });
    }
    this.selectAll = !this.selectAll;
  }

  private updateSelectAllState(): void {
    this.selectAll = this.selectedJobSeekers.size === this.jobSeekers.length;
  }

  getSelectedJobSeekers(): JobSeeker[] {
    return this.jobSeekers.filter(seeker => this.selectedJobSeekers.has(seeker.id));
  }

  createCampaign(): void {
    const selectedSeekers = this.getSelectedJobSeekers();
    if (selectedSeekers.length === 0) {
      alert('Please select at least one job seeker to create a campaign.');
      return;
    }

    // Navigate to campaign creation page with selected job seekers
    this.router.navigate(['/campaign'], { 
      state: { selectedJobSeekers: selectedSeekers } 
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'contacted': return 'status-contacted';
      case 'interviewed': return 'status-interviewed';
      case 'hired': return 'status-hired';
      default: return 'status-active';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'contacted': return 'Contacted';
      case 'interviewed': return 'Interviewed';
      case 'hired': return 'Hired';
      default: return 'Active';
    }
  }

  trackBySeekerId(_: number, seeker: JobSeeker): number {
    return seeker.id;
  }
}
