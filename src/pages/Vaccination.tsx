import React, { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import AppHeader from "@/components/AppHeader";
import { useVaccination } from "@/contexts/VaccinationContext";
import { Vaccine } from "@/types/vaccination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe, Calendar, CheckCircle2, Clock, Plus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  recommendedAge: z.string().min(1, "Recommended age is required"),
  administered: z.enum(["yes", "no"]),
  administeredDate: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const VaccinationPage: React.FC = () => {
  const { schedule, updateVaccine, addVaccine, removeVaccine, loading } = useVaccination();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      recommendedAge: "",
      administered: "no",
      administeredDate: "",
      dueDate: "",
      notes: "",
    },
  });

  const handleEditVaccine = (vaccine: Vaccine) => {
    setEditingVaccine(vaccine);
    form.reset({
      name: vaccine.name,
      description: vaccine.description,
      recommendedAge: vaccine.recommendedAge,
      administered: vaccine.administered ? "yes" : "no",
      administeredDate: vaccine.administeredDate || "",
      dueDate: vaccine.dueDate || "",
      notes: vaccine.notes || "",
    });
    setOpenDialog(true);
  };

  const handleAddNewVaccine = () => {
    setEditingVaccine(null);
    form.reset({
      name: "",
      description: "",
      recommendedAge: "",
      administered: "no",
      administeredDate: "",
      dueDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setOpenDialog(true);
  };

  const onSubmit = (data: FormValues) => {
    const vaccineData = {
      name: data.name,
      description: data.description,
      recommendedAge: data.recommendedAge,
      administered: data.administered === "yes",
      administeredDate: data.administered === "yes" ? data.administeredDate : undefined,
      dueDate: data.dueDate,
      notes: data.notes,
    };

    if (editingVaccine) {
      updateVaccine(editingVaccine.id, vaccineData);
    } else {
      addVaccine(vaccineData);
    }

    setOpenDialog(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error, "for date string:", dateString);
      return "Invalid date";
    }
  };

  const upcomingVaccines = schedule.vaccines.filter((v) => !v.administered);
  const administeredVaccines = schedule.vaccines.filter((v) => v.administered);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <AppHeader
        title="Vaccination"
        subtitle="Track your baby's immunization schedule"
      />

      <main className="flex-1 px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Syringe className="text-pink-500" size={24} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Vaccination Schedule
            </h2>
          </div>
          <Button
            onClick={handleAddNewVaccine}
            className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            <span>Add Vaccine</span>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="administered">Administered</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-48 rounded-3xl mb-4" />
                <Skeleton className="h-48 rounded-3xl mb-4" />
              </>
            ) : upcomingVaccines.length > 0 ? (
              upcomingVaccines.map((vaccine) => (
                <Card
                  key={vaccine.id}
                  className="rounded-3xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-pink-100"
                >
                  <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-pink-800">{vaccine.name}</CardTitle>
                        <CardDescription className="text-sm text-pink-600">
                          Recommended at {vaccine.recommendedAge}
                        </CardDescription>
                      </div>
                      <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                        <Clock size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm font-medium">
                          {vaccine.dueDate ? formatDate(vaccine.dueDate) : "No due date"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 mb-2">{vaccine.description}</p>
                    {vaccine.notes && (
                      <div className="bg-pink-50 p-2 rounded-lg mt-2">
                        <p className="text-sm text-pink-700">{vaccine.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-pink-100 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVaccine(vaccine)}
                      className="border-pink-200 text-pink-700 hover:bg-pink-50"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateVaccine(vaccine.id, { administered: true, administeredDate: new Date().toISOString() })}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    >
                      Mark as Administered
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">All Caught Up!</h3>
                <p className="text-gray-500 mt-2">
                  No upcoming vaccinations. Your baby's immunization schedule is up to date.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="administered" className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-48 rounded-3xl mb-4" />
                <Skeleton className="h-48 rounded-3xl mb-4" />
              </>
            ) : administeredVaccines.length > 0 ? (
              administeredVaccines.map((vaccine) => (
                <Card
                  key={vaccine.id}
                  className="rounded-3xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-green-100"
                >
                  <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-green-800">{vaccine.name}</CardTitle>
                        <CardDescription className="text-sm text-green-600">
                          Recommended at {vaccine.recommendedAge}
                        </CardDescription>
                      </div>
                      <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                        <Calendar size={16} className="text-green-500 mr-1" />
                        <span className="text-sm font-medium">
                          {vaccine.administeredDate ? formatDate(vaccine.administeredDate) : "Date not recorded"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 mb-2">{vaccine.description}</p>
                    {vaccine.notes && (
                      <div className="bg-green-50 p-2 rounded-lg mt-2">
                        <p className="text-sm text-green-700">{vaccine.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-green-100 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVaccine(vaccine)}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateVaccine(vaccine.id, { administered: false, administeredDate: undefined })}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Mark as Not Administered
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Syringe size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">No Records Yet</h3>
                <p className="text-gray-500 mt-2">
                  No vaccinations have been administered yet. They will appear here once marked as complete.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingVaccine ? "Edit Vaccination" : "Add New Vaccination"}
            </DialogTitle>
            <DialogDescription>
              {editingVaccine
                ? "Update the details for this vaccine."
                : "Enter the details for a new vaccine to add to the schedule."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., DTaP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description of the vaccine"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recommendedAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommended Age</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2 months" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="administered"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Administered Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Not Administered
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Administered
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("administered") === "yes" && (
                <FormField
                  control={form.control}
                  name="administeredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Administered</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes or information (optional)"
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any relevant notes about this vaccination.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                {editingVaccine && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      removeVaccine(editingVaccine.id);
                      setOpenDialog(false);
                    }}
                    className="sm:mr-auto"
                  >
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  {editingVaccine ? "Update" : "Add"} Vaccine
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VaccinationPage;
