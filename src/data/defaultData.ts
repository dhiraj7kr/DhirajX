export type SocialLinks = {
  github: string;
  linkedin: string;
  website?: string;
};

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  avatarUri?: string; // local image path
  social: SocialLinks;
};

export type Project = {
  id: string;
  title: string;
  shortDescription: string;
  problem: string;
  solution: string;
  techStack: string[];
  features: string[];
  githubUrl?: string;
  liveUrl?: string;
  screenshotUri?: string; // local image path
};

export type SkillCategory = {
  id: string;
  name: string;
  skills: string[];
};

export type EducationItem = {
  id: string;
  title: string;
  institution: string;
  period: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  details: string;
};

export type ContactSettings = {
  email: string;
  phone?: string;
};

export type AppData = {
  profile: Profile;
  projects: Project[];
  skills: SkillCategory[];
  education: EducationItem[];
  experience: ExperienceItem[];
  contact: ContactSettings;
};

export const defaultData: AppData = {
  profile: {
    name: 'Dhiraj Kumar',
    role: 'Full Stack Developer',
    tagline: 'Building clean, scalable products with React Native & more.',
    social: {
      github: 'https://github.com/your-github',
      linkedin: 'https://linkedin.com/in/your-linkedin',
      website: 'https://your-portfolio-site.com'
    }
  },
  projects: [
    {
      id: '1',
      title: 'DhirajX Portfolio',
      shortDescription: 'A React Native portfolio app with local JSON data.',
      problem: 'Developers need a simple, fast mobile portfolio they fully control.',
      solution:
        'A lightweight React Native app with tabs, local JSON storage, and editable UI.',
      techStack: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage'],
      features: [
        'Bottom tab navigation',
        'Project detail screens',
        'Local JSON persistence',
        'Gallery-based images'
      ],
      githubUrl: 'https://github.com/your-github/dhirajx',
      liveUrl: undefined,
      screenshotUri: undefined
    }
  ],
  skills: [
    {
      id: 'frontend',
      name: 'Frontend',
      skills: ['React', 'React Native', 'Expo', 'TypeScript']
    },
    {
      id: 'backend',
      name: 'Backend',
      skills: ['Node.js', 'Express', 'MongoDB']
    },
    {
      id: 'tools',
      name: 'Tools',
      skills: ['Git', 'GitHub', 'VS Code']
    }
  ],
  education: [
    {
      id: 'edu1',
      title: 'B.Tech in Computer Science',
      institution: 'Your University',
      period: '2016 — 2020'
    }
  ],
  experience: [
    {
      id: 'exp1',
      role: 'Software Engineer',
      company: 'Tech Company',
      period: '2020 — Present',
      details: 'Building full-stack applications and mobile apps.'
    }
  ],
  contact: {
    email: 'your-email@example.com'
  }
};
