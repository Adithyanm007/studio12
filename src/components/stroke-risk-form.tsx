
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
import { useTranslation } from '@/hooks/use-translation';

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
  model: 'stroke_model.pkl',
};

export function StrokeRiskForm({ onSubmit }: StrokeRiskFormProps) {
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

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
        <CardTitle>{t('form.title')}</CardTitle>
        <CardDescription>{t('form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {!isClient ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2"><FormLabel>{t('form.age.label')}</FormLabel><Input disabled /></div>
                    <div className="space-y-2"><FormLabel>{t('form.gender.label')}</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>{t('form.bmi.label')}</FormLabel><Input disabled /></div>
                    <div className="space-y-2"><FormLabel>{t('form.glucose.label')}</FormLabel><Input disabled /></div>
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-base font-medium">{t('form.medicalHistory.title')}</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>{t('form.hypertension.label')}</FormLabel><FormDescription>{t('form.hypertension.description')}</FormDescription></div><Switch disabled /></div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>{t('form.heartDisease.label')}</FormLabel><FormDescription>{t('form.heartDisease.description')}</FormDescription></div><Switch disabled /></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2"><FormLabel>{t('form.married.label')}</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>{t('form.residence.label')}</FormLabel><div className="h-10"></div></div>
                    <div className="space-y-2"><FormLabel>{t('form.work.label')}</FormLabel><Select disabled><SelectTrigger><SelectValue /></SelectTrigger></Select></div>
                    <div className="space-y-2"><FormLabel>{t('form.smoking.label')}</FormLabel><Select disabled><SelectTrigger><SelectValue /></SelectTrigger></Select></div>
                </div>
                <Button type="submit" className="w-full" disabled>
                  {t('form.submit.default')}
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
                      <FormLabel>{t('form.age.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('form.age.placeholder')} {...field} value={field.value ?? ''} />
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
                      <FormLabel>{t('form.gender.label')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Male" /></FormControl>
                            <FormLabel className="font-normal">{t('form.gender.male')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Female" /></FormControl>
                            <FormLabel className="font-normal">{t('form.gender.female')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Other" /></FormControl>
                            <FormLabel className="font-normal">{t('form.gender.other')}</FormLabel>
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
                      <FormLabel>{t('form.bmi.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder={t('form.bmi.placeholder')} {...field} value={field.value ?? ''} />
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
                      <FormLabel>{t('form.glucose.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder={t('form.glucose.placeholder')} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 rounded-lg border p-4">
                 <h3 className="text-base font-medium">{t('form.medicalHistory.title')}</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                          control={form.control}
                          name="hypertension"
                          render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                              <FormLabel>{t('form.hypertension.label')}</FormLabel>
                              <FormDescription>{t('form.hypertension.description')}</FormDescription>
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
                              <FormLabel>{t('form.heartDisease.label')}</FormLabel>
                              <FormDescription>{t('form.heartDisease.description')}</FormDescription>
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
                      <FormLabel>{t('form.married.label')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Yes" /></FormControl>
                            <FormLabel className="font-normal">{t('form.married.yes')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="No" /></FormControl>
                            <FormLabel className="font-normal">{t('form.married.no')}</FormLabel>
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
                      <FormLabel>{t('form.residence.label')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Urban" /></FormControl>
                            <FormLabel className="font-normal">{t('form.residence.urban')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Rural" /></FormControl>
                            <FormLabel className="font-normal">{t('form.residence.rural')}</FormLabel>
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
                      <FormLabel>{t('form.work.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form.work.placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Private">{t('form.work.private')}</SelectItem>
                          <SelectItem value="Self-employed">{t('form.work.selfEmployed')}</SelectItem>
                          <SelectItem value="Govt_job">{t('form.work.govtJob')}</SelectItem>
                          <SelectItem value="children">{t('form.work.children')}</SelectItem>
                          <SelectItem value="Never_worked">{t('form.work.neverWorked')}</SelectItem>
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
                      <FormLabel>{t('form.smoking.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form.smoking.placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="formerly smoked">{t('form.smoking.formerly')}</SelectItem>
                          <SelectItem value="never smoked">{t('form.smoking.never')}</SelectItem>
                          <SelectItem value="smokes">{t('form.smoking.smokes')}</SelectItem>
                          <SelectItem value="Unknown">{t('form.smoking.unknown')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stroke_model.pkl">Default (Decision Tree)</SelectItem>
                        <SelectItem value="logistic_regression_model.pkl">Logistic Regression</SelectItem>
                        <SelectItem value="random_forest_model.pkl">Random Forest</SelectItem>
                        <SelectItem value="gradient_boosting_model.pkl">Gradient Boosting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose which AI model to use for the prediction.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? t('form.submit.loading') : t('form.submit.default')}
              </Button>
            </form>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
