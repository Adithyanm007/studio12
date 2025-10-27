
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StrokeRiskFormProps {
  onSubmit: (data: StrokeRiskFormValues) => void;
}

const defaultFormValues: StrokeRiskFormValues = {
  gender: 'Male',
  age: 50,
  hypertension: false,
  heartDisease: false,
  everMarried: 'Yes',
  workType: 'Private',
  residenceType: 'Urban',
  avgGlucoseLevel: 100,
  bmi: 25,
  smokingStatus: 'never smoked',
};

export function StrokeRiskForm({ onSubmit }: StrokeRiskFormProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<StrokeRiskFormValues>({
    resolver: zodResolver(strokeRiskSchema),
    // No default values on server
  });
  
  useEffect(() => {
    if (isClient) {
      // Set default values on the client
      form.reset(defaultFormValues);
    }
  }, [isClient, form]);

  const { isSubmitting } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Profile</CardTitle>
        <CardDescription>
          Please provide the following information to assess your stroke risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {!isClient ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2"><FormLabel>Age</FormLabel><Input disabled /></div>
                    <div className="space-y-2"><FormLabel>Gender</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>Body Mass Index (BMI)</FormLabel><Input disabled /></div>
                    <div className="space-y-2"><FormLabel>Average Glucose Level</FormLabel><Input disabled /></div>
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-base font-medium">Medical History</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Hypertension</FormLabel><FormDescription>History of high blood pressure.</FormDescription></div><Switch disabled /></div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Heart Disease</FormLabel><FormDescription>History of heart disease.</FormDescription></div><Switch disabled /></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2"><FormLabel>Ever Married?</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>Residence Type</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>Work Type</FormLabel><Select disabled><SelectTrigger><SelectValue /></SelectTrigger></Select></div>
                    <div className="space-y-2"><FormLabel>Smoking Status</FormLabel><Select disabled><SelectTrigger><SelectValue /></SelectTrigger></Select></div>
                </div>
                <Button type="submit" className="w-full" disabled>
                  Calculate Risk
                </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 55" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Male" /></FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Female" /></FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Other" /></FormControl>
                            <FormLabel className="font-normal">Other</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Mass Index (BMI)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 28.7" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgGlucoseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Glucose Level</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 105.3" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 rounded-lg border p-4">
                 <h3 className="text-base font-medium">Medical History</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                          control={form.control}
                          name="hypertension"
                          render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                              <FormLabel>Hypertension</FormLabel>
                              <FormDescription>History of high blood pressure.</FormDescription>
                              </div>
                              <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="heartDisease"
                          render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                              <FormLabel>Heart Disease</FormLabel>
                              <FormDescription>History of heart disease.</FormDescription>
                              </div>
                              <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                          </FormItem>
                          )}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="everMarried"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ever Married?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Yes" /></FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="No" /></FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="residenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence Type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Urban" /></FormControl>
                            <FormLabel className="font-normal">Urban</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Rural" /></FormControl>
                            <FormLabel className="font-normal">Rural</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a work type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Private">Private</SelectItem>
                          <SelectItem value="Self-employed">Self-employed</SelectItem>
                          <SelectItem value="Govt_job">Government Job</SelectItem>
                          <SelectItem value="children">Children</SelectItem>
                          <SelectItem value="Never_worked">Never Worked</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select smoking status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="formerly smoked">Formerly Smoked</SelectItem>
                          <SelectItem value="never smoked">Never Smoked</SelectItem>
                          <SelectItem value="smokes">Smokes</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Analyzing...' : 'Calculate Risk'}
              </Button>
            </form>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
