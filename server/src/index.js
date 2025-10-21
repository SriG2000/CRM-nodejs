import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let templates = [
  { id: 'welcome', name: 'Welcome Email', description: 'Introduce your brand', content: 'Welcome to our community!' },
  { id: 'intro', name: 'Product Introduction', description: 'Showcase your product', content: 'Discover our latest offering.' },
  { id: 'case_study', name: 'Case Study', description: 'Share success stories', content: 'See how customers achieve success.' },
  { id: 'demo', name: 'Demo Invitation', description: 'Invite to product demo', content: 'Join us for a live demo.' },
  { id: 'testimonial', name: 'Customer Testimonials', description: 'Social proof', content: 'Hear from our happy clients.' },
  { id: 'offer', name: 'Special Offer', description: 'Limited time discount', content: 'Unlock an exclusive offer today.' },
  { id: 'follow_up', name: 'Follow-up Email', description: 'Check in with prospect', content: 'Just checking in after our conversation.' },
  { id: 'resource', name: 'Resource Share', description: 'Valuable content', content: 'Here is a resource we think you will love.' },
  { id: 'reminder', name: 'Gentle Reminder', description: 'Re-engage prospect', content: 'We would love to hear back from you.' },
  { id: 'final', name: 'Final Touchpoint', description: 'Last attempt to engage', content: 'Final opportunity to connect with us.' }
];

const timeIntervals = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 30, label: '1 month' }
];

const campaigns = [];

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Drip Campaign API is running.' });
});

app.get('/api/templates', (req, res) => {
  res.json(templates);
});

app.post('/api/templates', (req, res) => {
  const { name, description, content } = req.body;

  if (!name || !description || !content) {
    return res.status(400).json({ error: 'Name, description, and content are required.' });
  }

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (templates.some((template) => template.id === id)) {
    return res.status(409).json({ error: 'A template with this name already exists.' });
  }

  const newTemplate = { id, name, description, content };
  templates.push(newTemplate);

  res.status(201).json(newTemplate);
});

app.get('/api/time-intervals', (req, res) => {
  res.json(timeIntervals);
});

app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const { name, drips } = req.body;

  if (!name || !Array.isArray(drips) || drips.length === 0) {
    return res.status(400).json({ error: 'Campaign name and drip configuration are required.' });
  }

  const timestamp = new Date().toISOString();
  const campaign = {
    id: `campaign_${campaigns.length + 1}`,
    name,
    createdAt: timestamp,
    drips,
  };

  campaigns.push(campaign);
  res.status(201).json(campaign);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`CRM Drip Campaign API listening on port ${PORT}`);
});
