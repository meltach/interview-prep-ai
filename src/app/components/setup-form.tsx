'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterview } from '@/app/context/InterviewContext';
import { motion } from 'framer-motion';

export function SetupForm() {
    const {
        role,
        resume,
        fileName,
        updateField,
        handleFileUpload,
        generateQuestions,
        isGenerating,
        isParsing 
    } = useInterview();

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleClearFile = () => {
        updateField('file', null);
        updateField('fileName', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const canSubmit = role.trim() && (resume.trim() || fileName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
        >
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Interview Preparation</CardTitle>
                    <CardDescription>
                        Enter your target role and upload your resume. We&apos;ll generate tailored interview questions.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Role Input */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Target Job Role</Label>
                        <Input
                            id="role"
                            placeholder="e.g. Frontend Developer, Product Manager, Data Scientist"
                            value={role}
                            onChange={(e) => updateField('role', e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Resume Upload Section */}
                    <div className="space-y-2">
                        <Label htmlFor="resume">Your Resume</Label>

                        {/* File Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="resume-file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileInputChange}
                            />

                            {fileName ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FileText className="h-6 w-6 text-blue-500" />
                                    <span className="font-medium">{fileName}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFile}
                                        className="text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <Upload className="h-10 w-10 text-gray-400" />
                                    </div>
                                        <div>
                                            <p className="text-gray-600">Drag and drop your resume file here, or</p>
                                            <Button
                                                variant="ghost"
                                                className="text-blue-500 mt-2"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Browse files
                                            </Button>
                                    </div>
                                    <p className="text-xs text-gray-400">Supports PDF, DOC, DOCX, and TXT files (5MB max)</p>
                                </div>
                            )}
                        </div>

                        {/* Resume Text Area */}
                        <div className="mt-4">
                            <Label htmlFor="resume-text" className="flex justify-between">
                                <span>Or paste your resume content</span>
                                <span className="text-xs text-gray-500">
                                    {resume.length} characters
                                </span>
                            </Label>
                            <Textarea
                                id="resume-text"
                                placeholder="Paste the content of your resume here..."
                                value={resume}
                                onChange={(e) => updateField('resume', e.target.value)}
                                className="min-h-32 mt-1"
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-4">
                    <Button
                        onClick={generateQuestions}
                        disabled={!canSubmit || isGenerating || isParsing}
                        className="px-6"
                    >
                        {isGenerating ? (
                            <>
                                {isParsing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Parsing resume...
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating questions...
                                    </>
                                )}
                            </>
                        ) : (
                            'Generate Interview Questions'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}