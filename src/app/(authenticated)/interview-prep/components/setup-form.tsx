
// src\app\(authenticated)\interview-prep\components\setup-form.tsx
'use client';

import { Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRef } from 'react';
interface SetupFormProps {
    role: string;
    setRole: (role: string) => void;
    resume: string;
    setResume: (resume: string) => void;
    fileName: string;
    setFileName: (fileName: string) => void;
    generateQuestions: () => void;
    isGenerating: boolean;
}

export function SetupForm({
    role,
    setRole,
    resume,
    setResume,
    fileName,
    setFileName,
    generateQuestions,
    isGenerating,
}: SetupFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            // In a real app, you would handle file reading here
            const reader = new FileReader();
            reader.onload = (event) => {
                setResume(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl">Let&#39;s prepare for your interview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">
                            What role are you interviewing for?
                        </Label>
                        <Input
                            id="role"
                            placeholder="e.g. Frontend Engineer, Product Manager"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>

                    {/* Resume Input */}
                    <div className="space-y-2">
                        <Label>
                            Upload or paste your resume
                        </Label>

                        <div className="space-y-4">
                            {/* Text Area */}
                            <Textarea
                                placeholder="Paste your resume here..."
                                className="min-h-32"
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                            />

                            {/* Or divider */}
                            <div className="flex items-center">
                                <Separator className="flex-1" />
                                <span className="px-4 text-sm text-gray-500">OR</span>
                                <Separator className="flex-1" />
                            </div>

                            {/* File Upload */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Upload your resume (PDF, DOCX)</p>
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Browse Files
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.docx,.doc,.txt"
                                    />
                                </Button>
                                {fileName && (
                                    <div className="mt-3 text-sm text-gray-600 flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-1" />
                                        {fileName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={generateQuestions}
                        disabled={!role || !resume || isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Generating Questions...
                            </>
                        ) : (
                            'Generate Interview Questions'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}