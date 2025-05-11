import React, { createContext, useContext, useState, useEffect } from "react";
import { Vaccine, VaccinationSchedule } from "@/types/vaccination";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Default vaccination schedule
const defaultVaccines: Vaccine[] = [
  {
    id: "1",
    name: "Hepatitis B (HepB)",
    description: "Protects against hepatitis B virus infection",
    recommendedAge: "Birth",
    administered: false,
    dueDate: new Date().toISOString()
  },
  {
    id: "2",
    name: "Rotavirus (RV)",
    description: "Protects against rotavirus infection, which can cause severe diarrhea",
    recommendedAge: "2 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "3",
    name: "Diphtheria, Tetanus, & Pertussis (DTaP)",
    description: "Protects against diphtheria, tetanus, and pertussis (whooping cough)",
    recommendedAge: "2 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "4",
    name: "Haemophilus influenzae type b (Hib)",
    description: "Protects against Haemophilus influenzae type b",
    recommendedAge: "2 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "5",
    name: "Pneumococcal conjugate (PCV13)",
    description: "Protects against pneumococcal disease",
    recommendedAge: "2 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "6",
    name: "Inactivated Poliovirus (IPV)",
    description: "Protects against polio",
    recommendedAge: "2 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString()
  },
  {
    id: "7",
    name: "Influenza (Flu)",
    description: "Protects against flu",
    recommendedAge: "6 months and annually",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
  },
  {
    id: "8",
    name: "Measles, Mumps, Rubella (MMR)",
    description: "Protects against measles, mumps, and rubella",
    recommendedAge: "12-15 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString()
  },
  {
    id: "9",
    name: "Varicella (VAR)",
    description: "Protects against chickenpox",
    recommendedAge: "12-15 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString()
  },
  {
    id: "10",
    name: "Hepatitis A (HepA)",
    description: "Protects against hepatitis A virus infection",
    recommendedAge: "12-23 months",
    administered: false,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString()
  }
];

interface VaccinationContextType {
  schedule: VaccinationSchedule;
  updateVaccine: (id: string, updates: Partial<Vaccine>) => void;
  addVaccine: (vaccine: Omit<Vaccine, "id">) => void;
  removeVaccine: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const VaccinationContext = createContext<VaccinationContextType | undefined>(undefined);

export const VaccinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedule, setSchedule] = useState<VaccinationSchedule>(() => {
    // Try to load from localStorage first
    const savedSchedule = localStorage.getItem('babyMonitor_vaccinationSchedule');
    return savedSchedule 
      ? JSON.parse(savedSchedule) 
      : { vaccines: defaultVaccines, lastUpdated: new Date().toISOString() };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Validate date strings in schedule to fix any invalid data when loading from storage
  useEffect(() => {
    // Check if there are any vaccines with invalid dates and fix them
    const hasInvalidDates = schedule.vaccines.some(v => {
      if (v.dueDate && typeof v.dueDate === 'string') {
        try {
          const date = new Date(v.dueDate);
          return isNaN(date.getTime());
        } catch {
          return true;
        }
      }
      if (v.administeredDate && typeof v.administeredDate === 'string') {
        try {
          const date = new Date(v.administeredDate);
          return isNaN(date.getTime());
        } catch {
          return true;
        }
      }
      return false;
    });

    if (hasInvalidDates) {
      console.log("Fixing invalid dates in vaccination schedule");
      const fixedVaccines = schedule.vaccines.map(v => {
        const fixed = { ...v };
        
        // Fix due date if invalid
        if (v.dueDate) {
          try {
            const date = new Date(v.dueDate);
            if (isNaN(date.getTime())) {
              fixed.dueDate = new Date().toISOString();
            }
          } catch {
            fixed.dueDate = new Date().toISOString();
          }
        }
        
        // Fix administered date if invalid
        if (v.administeredDate) {
          try {
            const date = new Date(v.administeredDate);
            if (isNaN(date.getTime())) {
              fixed.administeredDate = new Date().toISOString();
            }
          } catch {
            fixed.administeredDate = new Date().toISOString();
          }
        }
        
        return fixed;
      });
      
      setSchedule(prev => ({
        ...prev,
        vaccines: fixedVaccines,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, []);

  // Save to localStorage whenever schedule changes
  useEffect(() => {
    localStorage.setItem('babyMonitor_vaccinationSchedule', JSON.stringify(schedule));
  }, [schedule]);

  const updateVaccine = (id: string, updates: Partial<Vaccine>) => {
    setLoading(true);
    try {
      setSchedule(prev => {
        const newVaccines = prev.vaccines.map(vaccine => 
          vaccine.id === id ? { ...vaccine, ...updates } : vaccine
        );

        if (isAuthenticated) {
          toast({
            title: "Vaccine Updated",
            description: `${updates.name || 'Vaccine'} information has been updated.`,
          });
        }

        return {
          vaccines: newVaccines,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (err) {
      setError("Failed to update vaccine information");
      if (isAuthenticated) {
        toast({
          title: "Update Failed",
          description: "Failed to update vaccine information.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addVaccine = (vaccine: Omit<Vaccine, "id">) => {
    setLoading(true);
    try {
      // Ensure dates are valid ISO strings
      const sanitizedVaccine = {
        ...vaccine,
        dueDate: vaccine.dueDate ? new Date(vaccine.dueDate).toISOString() : undefined,
        administeredDate: vaccine.administeredDate ? new Date(vaccine.administeredDate).toISOString() : undefined
      };

      const newVaccine: Vaccine = {
        ...sanitizedVaccine,
        id: Date.now().toString(), // Generate a unique ID
      };

      setSchedule(prev => ({
        vaccines: [...prev.vaccines, newVaccine],
        lastUpdated: new Date().toISOString()
      }));

      if (isAuthenticated) {
        toast({
          title: "Vaccine Added",
          description: `${vaccine.name} has been added to the schedule.`,
        });
      }
    } catch (err) {
      setError("Failed to add new vaccine");
      if (isAuthenticated) {
        toast({
          title: "Addition Failed",
          description: "Failed to add new vaccine to the schedule.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeVaccine = (id: string) => {
    setLoading(true);
    try {
      setSchedule(prev => {
        const vaccineToRemove = prev.vaccines.find(v => v.id === id);
        const newVaccines = prev.vaccines.filter(vaccine => vaccine.id !== id);

        if (isAuthenticated && vaccineToRemove) {
          toast({
            title: "Vaccine Removed",
            description: `${vaccineToRemove.name} has been removed from the schedule.`,
          });
        }

        return {
          vaccines: newVaccines,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (err) {
      setError("Failed to remove vaccine");
      if (isAuthenticated) {
        toast({
          title: "Removal Failed",
          description: "Failed to remove vaccine from the schedule.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VaccinationContext.Provider
      value={{
        schedule,
        updateVaccine,
        addVaccine,
        removeVaccine,
        loading,
        error
      }}
    >
      {children}
    </VaccinationContext.Provider>
  );
};

export const useVaccination = (): VaccinationContextType => {
  const context = useContext(VaccinationContext);
  if (context === undefined) {
    throw new Error("useVaccination must be used within a VaccinationProvider");
  }
  return context;
};
