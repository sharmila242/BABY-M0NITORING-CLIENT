
export interface Vaccine {
  id: string;
  name: string;
  description: string;
  recommendedAge: string; // e.g., "2 months"
  administered: boolean;
  administeredDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface VaccinationSchedule {
  vaccines: Vaccine[];
  lastUpdated?: string;
}
