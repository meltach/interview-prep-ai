'use client';

import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import './style.css';
import { Question } from '../types';

function cleanQuestionText(text: string) {
    return text
        .replace(/"/g, '')     // Remove all double quotes
        .replace(/^>\s*/, '')  // Remove leading '>' and any spaces after it
}

interface QuestionCardProps {
    question: Question;
    handleAnswerChange?: (id: string, value: string) => void;
    submitAnswer?: (id: string) => void;
    toggleFeedback: (id: string) => void;
    readOnly?: boolean;
}

export function QuestionCard({
    question,
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
    readOnly = false
}: QuestionCardProps) {
    const [streamedFeedback, setStreamedFeedback] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    console.log('isReadOnly', readOnly);

    useEffect(() => {
        if (question.showFeedback && question.feedback && !readOnly) {
            setIsStreaming(true);
            setStreamedFeedback('');

            let currentIndex = 0;
            const feedbackText = question.feedback || '';

            const streamInterval = setInterval(() => {
                if (currentIndex < feedbackText.length) {
                    // Stream 1-3 characters at a time for natural effect
                    const charsToAdd = Math.floor(Math.random() * 3) + 1;
                    currentIndex = Math.min(currentIndex + charsToAdd, feedbackText.length);
                    setStreamedFeedback(feedbackText.substring(0, currentIndex));
                } else {
                    clearInterval(streamInterval);
                    setIsStreaming(false);
                }
            }, 10); // Adjust timing for desired speed

            return () => clearInterval(streamInterval);
        }
    }, [question.showFeedback, question.feedback, readOnly]);

    const handleLocalAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (handleAnswerChange) {
            handleAnswerChange(question.id, e.target.value);
        }
    };

    const canSubmit = question.userAnswer?.trim() && !question.isSubmitting;
    const showSubmitButton = (!question.isAnswered || isEditing)
    const isDisabled = question.isAnswered && !isEditing;


    return (
        <Card className="w-full mx-auto">
            {/* Question */}
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Question</CardTitle>
                <div className='markdown-preview'>
                    <ReactMarkdown>
                        {cleanQuestionText(question.text)}
                    </ReactMarkdown>
                </div>
            </CardHeader>

            {/* Answer Section */}
            <CardContent>
                {readOnly && (
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {question.isAnswered ? 'Your Answer' : 'Practice Answer'}
                    </h4>
                )}

                <Textarea
                    placeholder="Type your answer here..."
                    className={`min-h-32 mb-4 ${isDisabled ? 'bg-gray-50' : 'bg-white'}`}
                    value={question.userAnswer || ''}
                    onChange={handleLocalAnswerChange}
                    disabled={isDisabled && !isEditing}
                />

                {showSubmitButton && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => submitAnswer && submitAnswer(question.id)}
                            disabled={!canSubmit}
                        >
                            {question.isSubmitting ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Answer
                                </>
                            )}
                        </Button>
                        {question.isAnswered && (
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit Answer'}
                            </Button>
                        )}
                    </div>
                )}

                {question.isAnswered && !isEditing && (
                    <Collapsible
                        open={question.showFeedback}
                        onOpenChange={() => toggleFeedback(question.id)}
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="secondary"
                                className="w-full justify-between mt-4"
                            >
                                <span>Feedback</span>
                                {question.showFeedback ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className="mt-4 pt-4">
                                <Separator className="mb-4" />
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Feedback</h4>
                                <div className="p-4 bg-slate-50 rounded-lg text-gray-700 text-sm leading-relaxed space-y-2">
                                    <div className='markdown-preview'>
                                        <ReactMarkdown>
                                            {readOnly
                                                ? question.feedback ?? ''
                                                : streamedFeedback + (isStreaming ? ' ▋' : '')
                                            }
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>
        </Card>
    );
}