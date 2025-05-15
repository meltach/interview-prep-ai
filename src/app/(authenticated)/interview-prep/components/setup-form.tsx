'use client';

import { Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRef } from 'react';
import { LoadingSpinner } from './skeletons';
import { InterviewFormState } from '@/app/hooks/useInterviewForm';

interface SetupFormProps {
    formState: InterviewFormState;
    updateField: <K extends keyof InterviewFormState>(field: K, value: InterviewFormState[K]) => void;
    handleFileUpload: (file: File | null) => void;
    generateQuestions: () => Promise<void>;
    isGenerating: boolean;
    isParsing: boolean;
}

export function SetupForm({
    formState,
    updateField,
    handleFileUpload,
    generateQuestions,
    isGenerating,
    isParsing
}: SetupFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { role, resume, fileName } = formState;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            handleFileUpload(uploadedFile);
        }
    };

    const isLoading = isGenerating || isParsing;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl">Let&#39;s prepare for your interview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                            What role are you interviewing for?
                        </Label>
                        <Input
                            id="role"
                            placeholder="e.g. Frontend Engineer, Product Manager"
                            value={role}
                            onChange={(e) => updateField('role', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Upload or paste your resume</Label>
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Paste your resume here..."
                                className="min-h-32"
                                value={resume}
                                onChange={(e) => updateField('resume', e.target.value)}
                            />

                            <div className="flex items-center">
                                <Separator className="flex-1" />
                                <span className="px-4 text-sm text-gray-500">OR</span>
                                <Separator className="flex-1" />
                            </div>

                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Upload your resume (PDF, DOCX, TXT)</p>
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                >
                                    Browse Files
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,.doc,.txt"
                                        disabled={isLoading}
                                    />
                                </Button>
                                {fileName && (
                                    <div className="mt-3 text-sm text-gray-600 flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-1" />
                                        {fileName}
                                        {formState.file?.type === 'application/pdf' && (
                                            <span className="ml-2 text-gray-500 text-xs">
                                                (Will be processed when generating questions)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={generateQuestions}
                        disabled={!role || (!formState.file && !resume) || isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size={4} />
                                <span>
                                    {isParsing ? "Processing file..." : "Generating questions..."}
                                </span>
                            </div>
                        ) : (
                            'Generate Interview Questions'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}