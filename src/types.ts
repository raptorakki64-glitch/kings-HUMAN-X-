export interface Metric {
  label: string;
  value: string;
  isRedAccent?: boolean;
}

export interface CaseStudy {
  id: string;
  category: string;
  title: string;
  description: string;
  metrics?: Metric[];
  bullets?: string[];
}

export interface Capability {
  id: string;
  name: string;
  description: string;
}

export interface ContactInput {
  name: string;
  email: string;
  interest: string;
  message: string;
}
